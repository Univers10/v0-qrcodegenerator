import "server-only"

import { createHash, randomBytes, randomUUID } from "node:crypto"
import { and, count, desc, eq, gte, inArray, max, sql, sum } from "drizzle-orm"

import { db } from "@/lib/db"
import { customerOrder, qrCode, type OrderLine } from "@/lib/db/schema"
import { orderInputSchema, statusFlow, whatsappLink, whatsappMessage, type OrderStatus } from "@/lib/orders"
import { enabledModes, isOrderable, menuSchema, unitPrice, type MenuData, type MenuItem } from "@/lib/qr/menu"
import { site } from "@/lib/site"

export type PlaceOrderResult =
  | { ok: true; number: number; token: string; total: number; whatsappUrl: string; trackingUrl: string }
  | { ok: false; error: string; status: number; field?: string }

const fail = (error: string, status = 400, field?: string): PlaceOrderResult => ({ ok: false, error, status, field })

function senderHash(headers: Headers) {
  const ip = (headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for") ?? "0.0.0.0").split(",")[0].trim()
  const day = new Date().toISOString().slice(0, 10)
  return createHash("sha256")
    .update(`${process.env.BETTER_AUTH_SECRET ?? "qrc"}|order|${day}|${ip}|${headers.get("user-agent") ?? ""}`)
    .digest("hex")
    .slice(0, 32)
}

/**
 * Enregistre une commande passée depuis la page publique d'un menu.
 * Les prix sont toujours recalculés à partir du menu enregistré : ceux du navigateur ne sont jamais utilisés.
 */
export async function placeOrder(input: unknown, headers: Headers): Promise<PlaceOrderResult> {
  const parsed = orderInputSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return fail(issue?.message ?? "Commande invalide", 400, issue?.path.join("."))
  }
  const { shortCode, mode, customer, lines } = parsed.data

  const qr = await db.query.qrCode.findFirst({ where: eq(qrCode.shortCode, shortCode) })
  if (!qr || qr.type !== "menu" || qr.status !== "active") return fail("Ce menu n'est pas disponible", 404)
  const menuResult = menuSchema.safeParse(qr.data)
  if (!menuResult.success) return fail("Ce menu n'est pas disponible", 404)
  const menu: MenuData = menuResult.data
  if (!menu.ordering.enabled) return fail("La commande en ligne n'est pas activée pour ce menu", 403)
  if (!enabledModes(menu.ordering).includes(mode)) return fail("Ce mode de commande n'est pas proposé", 400, "mode")

  const items = new Map<string, MenuItem>(menu.sections.flatMap((s) => s.items.map((i) => [i.id, i] as const)))
  const orderLines: OrderLine[] = []
  for (const line of lines) {
    const item = items.get(line.itemId)
    if (!item) return fail("Un produit de votre panier n'existe plus. Actualisez la carte.", 409)
    if (!isOrderable(item)) return fail(`« ${item.name} » n'est plus disponible`, 409)

    let variantLabel: string | null = null
    if (item.variants.length > 0) {
      const variant = item.variants.find((v) => v.id === line.variantId)
      if (!variant) return fail(`Choisissez une taille pour « ${item.name} »`, 409)
      variantLabel = variant.label
    }

    const chosen = new Set(line.choiceIds)
    const optionLabels: string[] = []
    for (const group of item.options) {
      const picked = group.choices.filter((c) => chosen.has(c.id))
      if (group.required && picked.length === 0) return fail(`« ${item.name} » : choix « ${group.name} » obligatoire`, 409)
      if (picked.length > group.max) return fail(`« ${item.name} » : ${group.max} choix maximum pour « ${group.name} »`, 409)
      optionLabels.push(...picked.map((c) => c.label))
    }
    const validChoiceIds = item.options.flatMap((g) => g.choices.map((c) => c.id)).filter((id) => chosen.has(id))
    const unit = unitPrice(item, item.variants.length > 0 ? line.variantId : null, validChoiceIds)
    if (unit === null) return fail(`« ${item.name} » n'a pas de prix`, 409)
    orderLines.push({
      itemId: item.id,
      name: item.name,
      variant: variantLabel,
      options: optionLabels,
      quantity: line.quantity,
      unitPrice: unit,
      total: unit * line.quantity,
    })
  }

  const subtotal = orderLines.reduce((s, l) => s + l.total, 0)
  if (menu.ordering.minOrder && subtotal < menu.ordering.minOrder)
    return fail("Le montant minimum de commande n'est pas atteint", 400, "minOrder")
  const deliveryFee = mode === "delivery" ? (menu.ordering.deliveryFee ?? 0) : 0
  const total = subtotal + deliveryFee

  // Anti-abus : 5 commandes maximum par expéditeur et par menu sur 10 minutes.
  const hash = senderHash(headers)
  const [recent] = await db
    .select({ value: count() })
    .from(customerOrder)
    .where(and(eq(customerOrder.qrCodeId, qr.id), eq(customerOrder.senderHash, hash), gte(customerOrder.createdAt, new Date(Date.now() - 10 * 60_000))))
  if ((recent?.value ?? 0) >= 5) return fail("Trop de commandes envoyées. Réessayez dans quelques minutes.", 429)

  const token = randomBytes(15).toString("base64url")
  let number = 0
  // Numérotation séquentielle par menu ; on réessaie en cas de commandes simultanées.
  for (let attempt = 0; attempt < 4; attempt++) {
    const [{ value: last }] = await db.select({ value: max(customerOrder.number) }).from(customerOrder).where(eq(customerOrder.qrCodeId, qr.id))
    number = (last ?? 0) + 1
    try {
      await db.insert(customerOrder).values({
        id: randomUUID(),
        qrCodeId: qr.id,
        userId: qr.userId,
        number,
        token,
        mode,
        customerName: customer.name,
        customerPhone: customer.phone,
        address: mode === "delivery" ? customer.address : null,
        tableNumber: mode === "dine_in" ? customer.table || null : null,
        note: customer.note || null,
        items: orderLines,
        subtotal,
        deliveryFee,
        total,
        currency: menu.currency,
        senderHash: hash,
      })
      break
    } catch (error) {
      if (attempt === 3) throw error
    }
  }

  const trackingUrl = `${site.url}/o/${token}`
  const text = whatsappMessage({
    number,
    restaurant: menu.restaurant.name,
    mode,
    customer,
    lines: orderLines,
    subtotal,
    deliveryFee,
    total,
    currency: menu.currency,
    trackingUrl,
  })
  return { ok: true, number, token, total, whatsappUrl: whatsappLink(menu.ordering.whatsapp, text), trackingUrl }
}

/* ------------------------------------------------------------------ */
/* Espace restaurateur                                                 */
/* ------------------------------------------------------------------ */

export async function listOrders(userId: string, { qrCodeId, since }: { qrCodeId?: string; since?: Date } = {}) {
  const rows = await db
    .select({ order: customerOrder, menuName: qrCode.name })
    .from(customerOrder)
    .innerJoin(qrCode, eq(customerOrder.qrCodeId, qrCode.id))
    .where(
      and(
        eq(customerOrder.userId, userId),
        qrCodeId ? eq(customerOrder.qrCodeId, qrCodeId) : undefined,
        since ? gte(customerOrder.createdAt, since) : undefined,
      ),
    )
    .orderBy(desc(customerOrder.createdAt))
    .limit(300)
  return rows.map((r) => ({ ...r.order, menuName: r.menuName }))
}

export type OrderRecord = Awaited<ReturnType<typeof listOrders>>[number]

/** Commandes à afficher sur le tableau de bord : toutes celles en cours, plus celles terminées depuis `since`. */
export async function boardOrders(userId: string, since: Date) {
  const rows = await db
    .select({ order: customerOrder, menuName: qrCode.name })
    .from(customerOrder)
    .innerJoin(qrCode, eq(customerOrder.qrCodeId, qrCode.id))
    .where(
      and(
        eq(customerOrder.userId, userId),
        sql`(${customerOrder.status} in ('new', 'preparing', 'ready', 'delivering') or ${customerOrder.createdAt} >= ${since.getTime()})`,
      ),
    )
    .orderBy(desc(customerOrder.createdAt))
    .limit(300)
  return rows.map((r) => ({ ...r.order, menuName: r.menuName }))
}

export async function orderStats(userId: string, since: Date) {
  const [row] = await db
    .select({
      orders: count(),
      revenue: sum(sql`case when ${customerOrder.status} != 'cancelled' then ${customerOrder.total} else 0 end`),
      cancelled: sum(sql`case when ${customerOrder.status} = 'cancelled' then 1 else 0 end`),
    })
    .from(customerOrder)
    .where(and(eq(customerOrder.userId, userId), gte(customerOrder.createdAt, since)))
  const orders = row?.orders ?? 0
  const cancelled = Number(row?.cancelled ?? 0)
  const revenue = Number(row?.revenue ?? 0)
  return { orders, revenue, average: orders - cancelled > 0 ? revenue / (orders - cancelled) : 0 }
}

export async function pendingOrderCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(customerOrder)
    .where(and(eq(customerOrder.userId, userId), inArray(customerOrder.status, ["new"])))
  return row?.value ?? 0
}

export async function setOrderStatus(userId: string, id: string, status: OrderStatus) {
  const order = await db.query.customerOrder.findFirst({ where: and(eq(customerOrder.id, id), eq(customerOrder.userId, userId)) })
  if (!order) return false
  if (status !== "cancelled" && !statusFlow(order.mode).includes(status)) return false
  await db.update(customerOrder).set({ status, updatedAt: new Date() }).where(eq(customerOrder.id, id))
  return true
}

export async function getOrderByToken(token: string) {
  const rows = await db
    .select({ order: customerOrder, data: qrCode.data, shortCode: qrCode.shortCode })
    .from(customerOrder)
    .innerJoin(qrCode, eq(customerOrder.qrCodeId, qrCode.id))
    .where(eq(customerOrder.token, token))
    .limit(1)
  return rows[0] ?? null
}

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000)
}

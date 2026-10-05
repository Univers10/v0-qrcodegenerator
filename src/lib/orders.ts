import { z } from "zod"

import { formatPrice, type OrderMode } from "@/lib/qr/menu"

/* ------------------------------------------------------------------ */
/* Saisie d'une commande (envoyée par la page publique du menu)        */
/* ------------------------------------------------------------------ */

const phone = z.string().trim().regex(/^\+?[\d\s().-]{8,24}$/, "Numéro de téléphone invalide")

export const orderInputSchema = z
  .object({
    shortCode: z.string().min(4).max(20),
    mode: z.enum(["delivery", "pickup", "dine_in"]),
    customer: z.object({
      name: z.string().trim().min(2, "Indiquez votre nom").max(60),
      phone,
      address: z.string().trim().max(300).optional().default(""),
      table: z.string().trim().max(20).optional().default(""),
      note: z.string().trim().max(300).optional().default(""),
    }),
    lines: z
      .array(
        z.object({
          itemId: z.string().min(1).max(40),
          variantId: z.string().max(40).nullable().default(null),
          choiceIds: z.array(z.string().max(40)).max(30).default([]),
          quantity: z.number().int().min(1).max(50),
        }),
      )
      .min(1, "Votre panier est vide")
      .max(40, "Panier trop volumineux"),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "delivery" && v.customer.address.length < 5)
      ctx.addIssue({ code: "custom", path: ["customer", "address"], message: "Indiquez l'adresse de livraison" })
  })

export type OrderInput = z.input<typeof orderInputSchema>

/* ------------------------------------------------------------------ */
/* Statuts                                                             */
/* ------------------------------------------------------------------ */

export type OrderStatus = "new" | "preparing" | "ready" | "delivering" | "completed" | "cancelled"

/** Étapes successives selon le mode de commande. */
export function statusFlow(mode: OrderMode): OrderStatus[] {
  if (mode === "delivery") return ["new", "preparing", "delivering", "completed"]
  return ["new", "preparing", "ready", "completed"]
}

export function nextStatus(status: OrderStatus, mode: OrderMode): OrderStatus | null {
  const flow = statusFlow(mode)
  const i = flow.indexOf(status)
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null
}

export function statusLabel(status: OrderStatus, mode: OrderMode) {
  switch (status) {
    case "new":
      return "Reçue"
    case "preparing":
      return "En préparation"
    case "ready":
      return mode === "dine_in" ? "Prête à servir" : "Prête à retirer"
    case "delivering":
      return "En livraison"
    case "completed":
      return mode === "delivery" ? "Livrée" : mode === "dine_in" ? "Servie" : "Retirée"
    case "cancelled":
      return "Annulée"
  }
}

/** Libellé du bouton qui fait passer la commande à l'étape suivante. */
export function advanceLabel(status: OrderStatus, mode: OrderMode) {
  const next = nextStatus(status, mode)
  if (!next) return null
  if (next === "preparing") return "Accepter et préparer"
  if (next === "delivering") return "Partie en livraison"
  if (next === "ready") return mode === "dine_in" ? "Prête à servir" : "Prête à retirer"
  return mode === "delivery" ? "Marquer livrée" : mode === "dine_in" ? "Marquer servie" : "Marquer retirée"
}

export const MODE_LABELS: Record<OrderMode, string> = {
  delivery: "Livraison",
  pickup: "À emporter",
  dine_in: "Sur place",
}

/* ------------------------------------------------------------------ */
/* Message WhatsApp envoyé au restaurant                               */
/* ------------------------------------------------------------------ */

type MessageOrder = {
  number: number
  restaurant: string
  mode: OrderMode
  customer: { name: string; phone: string; address?: string | null; table?: string | null; note?: string | null }
  lines: { name: string; variant: string | null; options: string[]; quantity: number; total: number }[]
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
  trackingUrl: string
}

export function whatsappMessage(o: MessageOrder) {
  const money = (n: number) => formatPrice(n, o.currency).replace(/ | /g, " ")
  const lines = [
    `*Nouvelle commande n°${o.number}* — ${o.restaurant}`,
    "",
    `*${MODE_LABELS[o.mode]}*${o.mode === "dine_in" && o.customer.table ? ` · Table ${o.customer.table}` : ""}`,
    `${o.customer.name} · ${o.customer.phone}`,
  ]
  if (o.mode === "delivery" && o.customer.address) lines.push(`Adresse : ${o.customer.address}`)
  lines.push("")
  for (const l of o.lines) {
    lines.push(`${l.quantity} × ${l.name}${l.variant ? ` (${l.variant})` : ""} — ${money(l.total)}`)
    if (l.options.length) lines.push(`   + ${l.options.join(", ")}`)
  }
  lines.push("", `Sous-total : ${money(o.subtotal)}`)
  if (o.deliveryFee > 0) lines.push(`Livraison : ${money(o.deliveryFee)}`)
  lines.push(`*Total : ${money(o.total)}*`)
  if (o.customer.note) lines.push("", `Note : ${o.customer.note}`)
  lines.push("", `Suivi de la commande : ${o.trackingUrl}`)
  return lines.join("\n")
}

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`
}

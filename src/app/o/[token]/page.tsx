import { Bike, Check, ChefHat, CircleX, PackageCheck, ShoppingBag, Store, Utensils } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AutoRefresh } from "@/components/auto-refresh"
import { MODE_LABELS, statusFlow, statusLabel, type OrderStatus } from "@/lib/orders"
import { formatPrice, toViewMenu } from "@/lib/qr/menu"
import { getOrderByToken } from "@/lib/server/order-service"
import { cn, formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getOrderByToken((await params).token)
  return { title: found ? `Commande n°${found.order.number}` : "Commande", robots: { index: false } }
}

const STEP_ICONS: Record<OrderStatus, typeof Check> = {
  new: Check,
  preparing: ChefHat,
  ready: PackageCheck,
  delivering: Bike,
  completed: PackageCheck,
  cancelled: CircleX,
}

export default async function OrderTrackingPage({ params }: Props) {
  const { token } = await params
  const found = await getOrderByToken(token)
  if (!found) notFound()
  const { order, data, shortCode } = found
  const menu = toViewMenu(data)
  const accent = menu.accent
  const flow = statusFlow(order.mode)
  const current = flow.indexOf(order.status as OrderStatus)
  const cancelled = order.status === "cancelled"
  const done = order.status === "completed"
  const money = (n: number) => formatPrice(n, order.currency)
  const ModeIcon = order.mode === "delivery" ? Bike : order.mode === "pickup" ? ShoppingBag : Utensils

  return (
    <div className="min-h-svh bg-[#f4f4f5] px-4 py-8 text-zinc-900">
      {!done && !cancelled && <AutoRefresh seconds={15} />}
      <main className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3">
          {menu.restaurant.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={menu.restaurant.logo} alt="" className="size-11 rounded-xl object-cover" />
          ) : (
            <span className="grid size-11 place-items-center rounded-xl text-white" style={{ background: accent }}>
              <Store className="size-5" />
            </span>
          )}
          <div>
            <p className="text-[13px] text-zinc-500">{menu.restaurant.name}</p>
            <h1 className="text-xl font-extrabold tracking-tight">Commande n°{order.number}</h1>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold">
              <ModeIcon className="size-3.5" /> {MODE_LABELS[order.mode]}
            </span>
            <span className="text-xs text-zinc-500">{formatDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
          <p className="mt-4 text-[26px] leading-tight font-extrabold tracking-tight" style={{ color: cancelled ? "#dc2626" : accent }}>
            {statusLabel(order.status as OrderStatus, order.mode)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {cancelled
              ? "Cette commande a été annulée par le restaurant."
              : done
                ? "Merci pour votre commande, bon appétit !"
                : order.status === "new"
                  ? "Le restaurant va confirmer votre commande dans un instant."
                  : "Cette page se met à jour automatiquement."}
          </p>

          {!cancelled && (
            <ol className="mt-6 space-y-0">
              {flow.map((step, i) => {
                const reached = i <= current
                const Icon = STEP_ICONS[step]
                return (
                  <li key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn("grid size-8 place-items-center rounded-full transition-colors", !reached && "bg-zinc-100 text-zinc-400")}
                        style={reached ? { background: accent, color: "#fff" } : undefined}
                      >
                        <Icon className="size-4" />
                      </span>
                      {i < flow.length - 1 && <span className="h-6 w-0.5" style={{ background: i < current ? accent : "#e4e4e7" }} />}
                    </div>
                    <p className={cn("pt-1.5 text-[14.5px]", reached ? "font-semibold" : "text-zinc-400")}>{statusLabel(step, order.mode)}</p>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="text-[15px] font-bold">Récapitulatif</h2>
          <ul className="mt-3 space-y-2.5 text-[14px]">
            {order.items.map((line, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  <span className="font-semibold">{line.quantity} ×</span> {line.name}
                  {line.variant && <span className="text-zinc-500"> ({line.variant})</span>}
                  {line.options.length > 0 && <span className="block text-[12.5px] text-zinc-500">{line.options.join(", ")}</span>}
                </span>
                <span className="shrink-0 tabular-nums">{money(line.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t pt-3 text-[14px]">
            <div className="flex justify-between text-zinc-500">
              <dt>Sous-total</dt>
              <dd className="tabular-nums">{money(order.subtotal)}</dd>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-zinc-500">
                <dt>Livraison</dt>
                <dd className="tabular-nums">{money(order.deliveryFee)}</dd>
              </div>
            )}
            <div className="flex justify-between text-[16px] font-extrabold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(order.total)}</dd>
            </div>
          </dl>
          {order.address && <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-[13px] text-zinc-600">Livraison : {order.address}</p>}
        </section>

        <div className="grid grid-cols-2 gap-3">
          {menu.ordering.whatsapp && (
            <a
              href={`https://wa.me/${menu.ordering.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Bonjour, au sujet de ma commande n°${order.number}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-[#25D366] py-3.5 text-center text-[14px] font-bold text-white"
            >
              Contacter le restaurant
            </a>
          )}
          <Link href={`/p/${shortCode}`} className="rounded-2xl bg-white py-3.5 text-center text-[14px] font-bold ring-1 ring-black/10">
            Revoir la carte
          </Link>
        </div>
        <p className="pt-2 text-center text-[11px] text-zinc-400">Suivi de commande propulsé par QR Creator</p>
      </main>
    </div>
  )
}

"use client"

import { Bell, BellOff, Bike, Clock, MapPin, MoreHorizontal, Phone, ShoppingBag, StickyNote, Utensils, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setOrderStatusAction } from "@/lib/actions"
import type { OrderLine } from "@/lib/db/schema"
import { advanceLabel, MODE_LABELS, nextStatus, statusFlow, statusLabel, type OrderStatus } from "@/lib/orders"
import { formatPrice, type OrderMode } from "@/lib/qr/menu"
import { cn, timeAgo } from "@/lib/utils"

export type BoardOrder = {
  id: string
  number: number
  status: OrderStatus
  mode: OrderMode
  customerName: string
  customerPhone: string
  address: string | null
  tableNumber: string | null
  note: string | null
  items: OrderLine[]
  total: number
  currency: string
  createdAt: Date
  menuName: string
}

const COLUMNS: { key: string; title: string; statuses: OrderStatus[]; tone: string }[] = [
  { key: "new", title: "Nouvelles", statuses: ["new"], tone: "bg-rose-500" },
  { key: "preparing", title: "En préparation", statuses: ["preparing"], tone: "bg-amber-500" },
  { key: "ready", title: "Prêtes / en livraison", statuses: ["ready", "delivering"], tone: "bg-sky-500" },
  { key: "done", title: "Terminées", statuses: ["completed", "cancelled"], tone: "bg-emerald-500" },
]

const MODE_ICONS: Record<OrderMode, typeof Bike> = { delivery: Bike, pickup: ShoppingBag, dine_in: Utensils }

/** Petit signal sonore généré (aucun fichier audio à charger). */
function chime() {
  try {
    const ctx = new AudioContext()
    ;[880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      osc.type = "sine"
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.4)
    })
  } catch {
    /* audio indisponible */
  }
}

export function OrdersBoard({ orders }: { orders: BoardOrder[] }) {
  const router = useRouter()
  const [sound, setSound] = useState(true)
  const [tab, setTab] = useState("new")
  const [optimistic, applyOptimistic] = useOptimistic(orders, (state, change: { id: string; status: OrderStatus }) =>
    state.map((o) => (o.id === change.id ? { ...o, status: change.status } : o)),
  )
  const [, startTransition] = useTransition()
  const known = useRef<Set<string> | null>(null)

  // Actualisation en direct (toutes les 10 s, onglet visible)
  useEffect(() => {
    const id = setInterval(() => document.visibilityState === "visible" && router.refresh(), 10_000)
    return () => clearInterval(id)
  }, [router])

  // Alerte à l'arrivée d'une nouvelle commande
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id))
    if (known.current) {
      const fresh = orders.filter((o) => !known.current!.has(o.id) && o.status === "new")
      if (fresh.length) {
        if (sound) chime()
        toast.success(fresh.length > 1 ? `${fresh.length} nouvelles commandes` : `Nouvelle commande n°${fresh[0].number}`, {
          description: fresh.length === 1 ? `${fresh[0].customerName} · ${formatPrice(fresh[0].total, fresh[0].currency)}` : undefined,
        })
      }
    }
    known.current = ids
    const pending = orders.filter((o) => o.status === "new").length
    document.title = pending ? `(${pending}) Commandes · QR Creator` : "Commandes · QR Creator"
  }, [orders, sound])

  const move = (order: BoardOrder, status: OrderStatus) =>
    startTransition(async () => {
      applyOptimistic({ id: order.id, status })
      const result = await setOrderStatusAction(order.id, status)
      if (!result.ok) toast.error(result.error)
      else if (status === "cancelled") toast(`Commande n°${order.number} annulée`)
      router.refresh()
    })

  const columnOrders = (statuses: OrderStatus[]) => optimistic.filter((o) => statuses.includes(o.status))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab} className="md:hidden">
          <TabsList>
            {COLUMNS.map((c) => (
              <TabsTrigger key={c.key} value={c.key} className="gap-1.5">
                {c.title.split(" ")[0]}
                <span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums">{columnOrders(c.statuses).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Mise à jour automatique toutes les 10 secondes
        </p>
        <Button variant="outline" size="sm" onClick={() => setSound((s) => !s)} aria-pressed={sound}>
          {sound ? <Bell /> : <BellOff />} {sound ? "Son activé" : "Son coupé"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = columnOrders(col.statuses)
          return (
            <section key={col.key} className={cn("min-w-0 space-y-3", tab !== col.key && "hidden md:block")}>
              <header className="flex items-center gap-2 px-1">
                <span className={cn("size-2 rounded-full", col.tone)} />
                <h2 className="text-sm font-semibold">{col.title}</h2>
                <span className="ml-auto rounded-full bg-muted px-2 text-xs font-medium tabular-nums">{list.length}</span>
              </header>
              {list.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune commande</div>
              ) : (
                list.map((order) => <OrderCard key={order.id} order={order} onMove={move} />)
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function OrderCard({ order, onMove }: { order: BoardOrder; onMove: (o: BoardOrder, s: OrderStatus) => void }) {
  const next = nextStatus(order.status, order.mode)
  const label = advanceLabel(order.status, order.mode)
  const ModeIcon = MODE_ICONS[order.mode]
  const finished = order.status === "completed" || order.status === "cancelled"
  const phoneDigits = order.customerPhone.replace(/[^\d]/g, "")
  const flow = statusFlow(order.mode)
  const previous = flow[flow.indexOf(order.status) - 1]

  return (
    <Card className={cn("gap-0 overflow-hidden py-0 transition-shadow", order.status === "new" && "ring-2 ring-rose-500/40", finished && "opacity-70")}>
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div>
          <p className="text-lg leading-none font-bold">n°{order.number}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground" suppressHydrationWarning>
            <Clock className="size-3" /> {timeAgo(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="gap-1">
            <ModeIcon className="size-3" /> {MODE_LABELS[order.mode]}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions commande ${order.number}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={`tel:${order.customerPhone.replace(/[^\d+]/g, "")}`}>
                  <Phone /> Appeler le client
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Bonjour ${order.customerName}, au sujet de votre commande n°${order.number}`)}`} target="_blank" rel="noopener noreferrer">
                  <Phone /> Écrire sur WhatsApp
                </a>
              </DropdownMenuItem>
              {previous && order.status !== "cancelled" && (
                <DropdownMenuItem onClick={() => onMove(order, previous)}>Revenir à « {statusLabel(previous, order.mode)} »</DropdownMenuItem>
              )}
              {!finished && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onMove(order, "cancelled")}>
                    <X /> Annuler la commande
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-1 px-4 text-sm">
        <p className="font-medium">{order.customerName}</p>
        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
        {order.address && (
          <p className="flex gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3 shrink-0" /> {order.address}
          </p>
        )}
        {order.tableNumber && <p className="text-xs font-medium">Table {order.tableNumber}</p>}
      </div>

      <ul className="mx-4 mt-3 space-y-1.5 border-t pt-3 text-sm">
        {order.items.map((line, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span className="min-w-0">
              <span className="font-semibold">{line.quantity}×</span> {line.name}
              {line.variant && <span className="text-muted-foreground"> ({line.variant})</span>}
              {line.options.length > 0 && <span className="block truncate text-xs text-muted-foreground">+ {line.options.join(", ")}</span>}
            </span>
          </li>
        ))}
      </ul>
      {order.note && (
        <p className="mx-4 mt-2 flex gap-1.5 rounded-md bg-warning/10 px-2 py-1.5 text-xs text-warning">
          <StickyNote className="mt-0.5 size-3 shrink-0" /> {order.note}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t bg-muted/30 p-3">
        <span className="font-bold tabular-nums">{formatPrice(order.total, order.currency)}</span>
        {next && label ? (
          <Button size="sm" onClick={() => onMove(order, next)}>
            {label}
          </Button>
        ) : (
          <span className={cn("text-xs font-medium", order.status === "cancelled" ? "text-destructive" : "text-success")}>{statusLabel(order.status, order.mode)}</span>
        )}
      </div>
    </Card>
  )
}

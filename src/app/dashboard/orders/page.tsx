import { Clock, ReceiptText, ShoppingBag, UtensilsCrossed, Wallet } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { StatTile } from "@/components/analytics/stat-tile"
import { OrdersBoard } from "@/components/dashboard/orders-board"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"
import { formatPrice, toViewMenu } from "@/lib/qr/menu"
import { boardOrders, hoursAgo, orderStats } from "@/lib/server/order-service"
import { listQrCodes } from "@/lib/server/qr-service"

export const metadata: Metadata = { title: "Commandes" }

export default async function OrdersPage() {
  const session = await requireSession()
  const userId = session.user.id
  const since = hoursAgo(24)
  const [orders, stats, codes] = await Promise.all([boardOrders(userId, since), orderStats(userId, since), listQrCodes(userId)])

  const menus = codes.filter((c) => c.type === "menu")
  const orderingMenus = menus.filter((c) => toViewMenu(c.data).ordering.enabled)
  const currency = orders[0]?.currency ?? (orderingMenus[0] ? toViewMenu(orderingMenus[0].data).currency : "XOF")
  const pending = orders.filter((o) => o.status === "new").length
  const inProgress = orders.filter((o) => ["preparing", "ready", "delivering"].includes(o.status)).length

  if (orderingMenus.length === 0 && orders.length === 0) {
    return (
      <>
        <PageHeader title="Commandes" description="Recevez et suivez les commandes passées depuis vos menus." />
        <Card className="items-center px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag className="size-7" />
          </span>
          <div className="max-w-md space-y-2">
            <p className="text-lg font-medium">Activez la commande en ligne</p>
            <p className="text-sm text-muted-foreground">
              Vos clients composent leur panier depuis votre menu, la commande arrive sur votre WhatsApp et ici, où vous
              suivez sa préparation jusqu&apos;à la livraison.
            </p>
          </div>
          <Button asChild>
            <Link href={menus[0] ? `/dashboard/codes/${menus[0].id}/edit` : "/dashboard/codes/new?type=menu"}>
              <UtensilsCrossed /> {menus[0] ? "Activer sur mon menu" : "Créer un menu"}
            </Link>
          </Button>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Commandes" description="Suivez vos commandes en direct, de la réception à la livraison." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile label="Commandes" icon={ReceiptText} value={stats.orders} hint="dernières 24 h" />
        <StatTile label="Chiffre d'affaires" icon={Wallet} value={formatPrice(stats.revenue, currency)} hint="hors commandes annulées" />
        <StatTile label="Panier moyen" icon={ShoppingBag} value={formatPrice(Math.round(stats.average), currency)} hint="dernières 24 h" />
        <StatTile label="À traiter" icon={Clock} value={pending + inProgress} hint={`${pending} nouvelle${pending > 1 ? "s" : ""} · ${inProgress} en cours`} />
      </div>
      <OrdersBoard
        orders={orders.map((o) => ({
          id: o.id,
          number: o.number,
          status: o.status,
          mode: o.mode,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          address: o.address,
          tableNumber: o.tableNumber,
          note: o.note,
          items: o.items,
          total: o.total,
          currency: o.currency,
          createdAt: o.createdAt,
          menuName: o.menuName,
        }))}
      />
    </>
  )
}

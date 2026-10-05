import type { Metadata } from "next"
import { cookies } from "next/headers"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { requireSession } from "@/lib/auth"
import { getWorkspaceStats } from "@/lib/server/analytics"
import { pendingOrderCount } from "@/lib/server/order-service"

export const metadata: Metadata = {
  title: { default: "Tableau de bord", template: "%s · QR Creator" },
  robots: { index: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const [stats, pendingOrders, cookieStore] = await Promise.all([getWorkspaceStats(session.user.id), pendingOrderCount(session.user.id), cookies()])
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={{ name: session.user.name, email: session.user.email }} stats={{ ...stats, pendingOrders }} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumbs />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

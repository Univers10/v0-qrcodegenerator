import { ArrowRight, Plus, QrCode, Zap } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AnalyticsCharts, AnalyticsKpis, RecentScans } from "@/components/analytics/analytics-panel"
import { RangeSelect } from "@/components/analytics/range-select"
import { StatTile } from "@/components/analytics/stat-tile"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"
import { isQrType } from "@/lib/qr/content"
import { TYPE_META, TYPE_ORDER } from "@/lib/qr/meta"
import { getAnalytics, getRecentScans, getTopCodes, parseRange } from "@/lib/server/analytics"
import { listQrCodes } from "@/lib/server/qr-service"
import { formatNumber } from "@/lib/utils"

export const metadata: Metadata = { title: "Vue d'ensemble" }

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireSession()
  const range = parseRange((await searchParams).range)
  const userId = session.user.id
  const [codes, analytics, top, recent] = await Promise.all([
    listQrCodes(userId),
    getAnalytics({ userId }, range),
    getTopCodes(userId, range),
    getRecentScans({ userId }),
  ])
  const firstName = session.user.name.split(" ")[0]

  if (codes.length === 0) return <Onboarding firstName={firstName} />

  const totalAllTime = codes.reduce((sum, c) => sum + c.scanCount, 0)
  const dynamicActive = codes.filter((c) => c.isDynamic && c.status === "active").length

  return (
    <>
      <PageHeader
        title={`Bonjour ${firstName} 👋`}
        description="Voici l'activité de vos QR codes."
        actions={
          <>
            <RangeSelect value={range} />
            <Button asChild>
              <Link href="/dashboard/codes/new">
                <Plus /> Créer un QR code
              </Link>
            </Button>
          </>
        }
      />
      <div className="space-y-4">
        <AnalyticsKpis
          analytics={analytics}
          totalAllTime={totalAllTime}
          extra={<StatTile label="QR dynamiques actifs" icon={Zap} value={dynamicActive} hint={`sur ${codes.length} QR codes`} />}
        />
        <AnalyticsCharts analytics={analytics} />
        <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>QR codes les plus scannés</CardTitle>
              <CardDescription>Sur la période sélectionnée</CardDescription>
              <CardAction>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/codes">
                    Tout voir <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {top.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun scan sur la période.</p>
              ) : (
                <ol className="space-y-1">
                  {top.map((code, i) => {
                    const meta = isQrType(code.type) ? TYPE_META[code.type] : TYPE_META.url
                    return (
                      <li key={code.id}>
                        <Link
                          href={`/dashboard/codes/${code.id}`}
                          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                        >
                          <span className="w-4 text-center text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                          <span
                            className="grid size-9 place-items-center rounded-lg"
                            style={{ background: `color-mix(in oklch, ${meta.accent} 14%, transparent)`, color: meta.accent }}
                          >
                            <meta.icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{code.name}</span>
                            <span className="text-xs text-muted-foreground">{meta.label}</span>
                          </span>
                          <span className="text-sm font-medium tabular-nums">{formatNumber(code.scans)}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
          <RecentScans scans={recent} />
        </div>
      </div>
    </>
  )
}

function Onboarding({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_60%)]" />
        <CardContent className="relative p-8 text-center sm:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <QrCode className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">Bienvenue {firstName} !</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Créez votre premier QR code dynamique : vous pourrez modifier sa destination à tout moment et suivre ses scans ici.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-md shadow-primary/20">
            <Link href="/dashboard/codes/new">
              <Plus /> Créer mon premier QR code
            </Link>
          </Button>
        </CardContent>
      </Card>
      <p className="mt-10 mb-4 text-sm font-medium">Ou commencez par un type</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {TYPE_ORDER.map((type) => {
          const meta = TYPE_META[type]
          return (
            <Link
              key={type}
              href={`/dashboard/codes/new?type=${type}`}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span
                className="grid size-10 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklch, ${meta.accent} 14%, transparent)`, color: meta.accent }}
              >
                <meta.icon className="size-5" />
              </span>
              {meta.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

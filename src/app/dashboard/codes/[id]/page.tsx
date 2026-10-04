import { CalendarClock, FileSpreadsheet, Lock, MoreHorizontal, Pause, Pencil, ScanLine, UtensilsCrossed, Zap } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AnalyticsCharts, AnalyticsKpis, RecentScans } from "@/components/analytics/analytics-panel"
import { RangeSelect } from "@/components/analytics/range-select"
import { StatTile } from "@/components/analytics/stat-tile"
import { PageHeader } from "@/components/dashboard/page-header"
import { QrActionsMenu } from "@/components/dashboard/qr-actions"
import { QrDetailPreview } from "@/components/dashboard/qr-detail-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"
import { encodeContent, summarizeContent } from "@/lib/qr/content"
import { TYPE_META } from "@/lib/qr/meta"
import { getAnalytics, getRecentScans, parseRange } from "@/lib/server/analytics"
import { getQrCode } from "@/lib/server/qr-service"
import { formatDate, timeAgo } from "@/lib/utils"

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ range?: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [{ id }, session] = await Promise.all([params, requireSession()])
  const code = await getQrCode(session.user.id, id)
  return { title: code?.name ?? "QR code" }
}

export default async function CodeDetailPage({ params, searchParams }: Params) {
  const [{ id }, { range: rawRange }, session] = await Promise.all([params, searchParams, requireSession()])
  const code = await getQrCode(session.user.id, id)
  if (!code) notFound()

  const range = parseRange(rawRange)
  const meta = TYPE_META[code.type]
  const [analytics, recent] = code.isDynamic
    ? await Promise.all([getAnalytics({ userId: session.user.id, qrCodeId: id }, range), getRecentScans({ userId: session.user.id, qrCodeId: id }, 6)])
    : [null, []]

  const destination = encodeContent(code.type, code.data)

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="truncate">{code.name}</span>
            {code.isDynamic ? (
              code.status === "paused" ? (
                <Badge variant="outline" className="gap-1 border-warning/40 text-warning">
                  <Pause className="size-3" /> En pause
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Zap className="size-3 text-primary" /> Dynamique · actif
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Lock className="size-3" /> Statique
              </Badge>
            )}
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <meta.icon className="size-3.5" style={{ color: meta.accent }} /> {meta.label}
            </span>
            <span>Créé le {formatDate(code.createdAt)}</span>
            {code.updatedAt.getTime() - code.createdAt.getTime() > 60_000 && <span>Modifié {timeAgo(code.updatedAt)}</span>}
          </span>
        }
        actions={
          <>
            {code.isDynamic && <RangeSelect value={range} />}
            {code.isDynamic && (
              <Button variant="outline" asChild>
                <a href={`/api/codes/${code.id}/export?range=${range}`} download>
                  <FileSpreadsheet /> Exporter CSV
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href={`/dashboard/codes/${code.id}/edit`}>
                <Pencil /> Modifier
              </Link>
            </Button>
            <QrActionsMenu
              code={code}
              redirectOnDelete
              trigger={
                <Button variant="outline" size="icon" aria-label="Plus d'actions">
                  <MoreHorizontal />
                </Button>
              }
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <QrDetailPreview code={code} />
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-sm">{code.isDynamic ? "Destination actuelle" : "Contenu encodé"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium break-words">{summarizeContent(code.type, code.data)}</p>
              {code.type === "url" && (
                <a href={destination} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-primary hover:underline">
                  {destination}
                </a>
              )}
              {code.type === "menu" && (
                <Button asChild variant="outline" size="sm" className="mt-1 w-full">
                  <a href={`/p/${code.shortCode}`} target="_blank" rel="noopener noreferrer">
                    <UtensilsCrossed /> Voir la carte en ligne
                  </a>
                </Button>
              )}
              {code.isDynamic && (
                <p className="text-xs text-muted-foreground">
                  {code.type === "url" || code.type === "whatsapp" || code.type === "location"
                    ? "Redirection instantanée après le scan."
                    : "Le scan ouvre une page mobile dédiée avec les actions adaptées."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          {analytics ? (
            <>
              <AnalyticsKpis
                analytics={analytics}
                totalAllTime={code.scanCount}
                extra={
                  <StatTile
                    label="Dernier scan"
                    icon={CalendarClock}
                    value={code.lastScannedAt ? timeAgo(code.lastScannedAt) : "—"}
                    hint={`${code.scanCount} scans au total`}
                  />
                }
              />
              <AnalyticsCharts analytics={analytics} />
              <RecentScans scans={recent} showCode={false} />
            </>
          ) : (
            <Card className="items-center py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-muted">
                <ScanLine className="size-7 text-muted-foreground" />
              </span>
              <div className="max-w-md space-y-2 px-6">
                <p className="text-lg font-medium">Les QR codes statiques ne sont pas suivis</p>
                <p className="text-sm text-muted-foreground">
                  Le contenu est encodé directement dans le motif : le scan ne passe pas par nos serveurs. Passez en mode
                  dynamique pour mesurer les scans et modifier la destination à volonté.
                </p>
              </div>
              <Button asChild>
                <Link href={`/dashboard/codes/${code.id}/edit`}>
                  <Zap /> Passer en dynamique
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

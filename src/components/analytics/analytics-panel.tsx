import { Clock, Fingerprint, Globe2, Monitor, ScanLine, Smartphone, Tablet } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RANGES, type Analytics } from "@/lib/server/analytics"
import { countryFlag, countryName, formatNumber, timeAgo } from "@/lib/utils"
import { BreakdownList } from "./breakdown-list"
import { HoursBarChart, ScansAreaChart, WeekHeatmap } from "./charts"
import { StatTile } from "./stat-tile"

type RecentScan = {
  id: string
  createdAt: Date
  device: string
  os: string
  browser: string
  country: string | null
  city: string | null
  qrCodeId: string
  qrName: string
}

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Mobile: Smartphone,
  Tablette: Tablet,
  Ordinateur: Monitor,
}

export function AnalyticsKpis({ analytics, totalAllTime, extra }: { analytics: Analytics; totalAllTime: number; extra?: React.ReactNode }) {
  const { totals, hours } = analytics
  const peak = hours.reduce((best, h) => (h.value > best.value ? h : best), hours[0])
  const avg = totals.scans / analytics.days
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
      <StatTile label="Scans" icon={ScanLine} value={totals.scans} current={totals.scans} previous={totals.previousScans} hint="vs période précédente" />
      <StatTile label="Visiteurs uniques" icon={Fingerprint} value={totals.uniques} current={totals.uniques} previous={totals.previousUniques} hint="par jour, anonymisés" />
      {extra ?? <StatTile label="Scans depuis la création" icon={Globe2} value={totalAllTime} hint="tous QR codes confondus" />}
      <StatTile
        label="Heure de pointe"
        icon={Clock}
        value={peak.value > 0 ? `${peak.hour} h` : "—"}
        hint={peak.value > 0 ? `${formatNumber(Math.round(avg * 10) / 10)} scans / jour en moyenne` : "en attente de scans"}
      />
    </div>
  )
}

export function AnalyticsCharts({ analytics, recent }: { analytics: Analytics; recent?: RecentScan[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Évolution des scans</CardTitle>
          <CardDescription>
            {RANGES[analytics.range].label} · {analytics.granularity === "week" ? "par semaine" : "par jour"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScansAreaChart data={analytics.series} granularity={analytics.granularity} className="h-72" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>Technologie</CardTitle>
            <CardDescription>Appareils, systèmes et navigateurs utilisés</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices">
              <TabsList className="mb-4">
                <TabsTrigger value="devices">Appareils</TabsTrigger>
                <TabsTrigger value="os">Systèmes</TabsTrigger>
                <TabsTrigger value="browsers">Navigateurs</TabsTrigger>
              </TabsList>
              <TabsContent value="devices">
                <BreakdownList
                  items={analytics.devices.map((d) => {
                    const Icon = DEVICE_ICONS[d.key] ?? Monitor
                    return {
                      ...d,
                      label: (
                        <span className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" /> {d.key}
                        </span>
                      ),
                    }
                  })}
                />
              </TabsContent>
              <TabsContent value="os">
                <BreakdownList items={analytics.os} />
              </TabsContent>
              <TabsContent value="browsers">
                <BreakdownList items={analytics.browsers} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
            <CardDescription>D&apos;où viennent vos scans</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="countries">
              <TabsList className="mb-4">
                <TabsTrigger value="countries">Pays</TabsTrigger>
                <TabsTrigger value="cities">Villes</TabsTrigger>
              </TabsList>
              <TabsContent value="countries">
                <BreakdownList
                  items={analytics.countries.map((c) => ({
                    ...c,
                    label: (
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{countryFlag(c.key)}</span> {countryName(c.key)}
                      </span>
                    ),
                  }))}
                  empty="La localisation apparaît une fois l'application déployée (en-têtes géographiques de l'hébergeur)."
                />
              </TabsContent>
              <TabsContent value="cities">
                <BreakdownList items={analytics.cities} empty="Aucune ville identifiée sur la période." />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr] [&>*]:min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>Scans par heure</CardTitle>
            <CardDescription>Heure locale (Europe/Paris), pic mis en évidence</CardDescription>
          </CardHeader>
          <CardContent>
            <HoursBarChart data={analytics.hours} className="h-56" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jours et heures de pointe</CardTitle>
            <CardDescription>Intensité des scans selon le jour de la semaine et l&apos;heure</CardDescription>
          </CardHeader>
          <CardContent>
            <WeekHeatmap data={analytics.heatmap} />
          </CardContent>
        </Card>
      </div>

      {recent && <RecentScans scans={recent} />}
    </div>
  )
}

export function RecentScans({ scans, showCode = true }: { scans: RecentScan[]; showCode?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Activité récente
        </CardTitle>
        <CardDescription>Les derniers scans enregistrés</CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucun scan pour le moment.</p>
        ) : (
          <ul className="divide-y">
            {scans.map((s) => {
              const Icon = DEVICE_ICONS[s.device] ?? Monitor
              return (
                <li key={s.id} className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {showCode ? (
                      <Link href={`/dashboard/codes/${s.qrCodeId}`} className="block truncate font-medium hover:underline">
                        {s.qrName}
                      </Link>
                    ) : (
                      <p className="font-medium">
                        {s.os} · {s.browser}
                      </p>
                    )}
                    <p className="truncate text-xs text-muted-foreground">
                      {countryFlag(s.country)} {s.city ? `${s.city}, ` : ""}
                      {countryName(s.country)} · {showCode ? `${s.os} · ${s.browser}` : s.device}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(s.createdAt)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

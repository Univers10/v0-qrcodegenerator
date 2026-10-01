"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, formatNumber } from "@/lib/utils"

const scansConfig = { value: { label: "Scans", color: "var(--chart-1)" } } satisfies ChartConfig

const dayLabel = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...opts }).format(new Date(`${iso}T12:00:00Z`))

/** Tendance des scans : une seule série, aire légère + ligne 2 px, réticule au survol. */
export function ScansAreaChart({
  data,
  granularity,
  className,
}: {
  data: { date: string; value: number }[]
  granularity: "day" | "week"
  className?: string
}) {
  const empty = data.every((d) => d.value === 0)
  return (
    <div className={cn("relative", className)}>
      <ChartContainer config={scansConfig} className="aspect-auto h-full w-full">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="scans-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeOpacity={0.6} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={28}
            tickFormatter={(v: string) => dayLabel(v, { day: "numeric", month: "short" })}
          />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={44} tickFormatter={(v: number) => formatNumber(v)} />
          <ChartTooltip
            cursor={{ strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) => {
                  const iso = payload?.[0]?.payload?.date as string | undefined
                  if (!iso) return ""
                  const label = dayLabel(iso, { weekday: "long", day: "numeric", month: "long" })
                  return granularity === "week" ? `Semaine du ${label}` : label
                }}
              />
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2}
            fill="url(#scans-fill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
      {empty && <EmptyOverlay />}
    </div>
  )
}

/** Répartition horaire : colonnes ≤ 24 px, extrémité arrondie, pic mis en avant. */
export function HoursBarChart({ data, className }: { data: { hour: number; value: number }[]; className?: string }) {
  const max = Math.max(...data.map((d) => d.value))
  const empty = max === 0
  return (
    <div className={cn("relative", className)}>
      <ChartContainer config={scansConfig} className="aspect-auto h-full w-full">
        <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -12 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} strokeOpacity={0.6} />
          <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} interval={2} tickFormatter={(h: number) => `${h} h`} />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={44} />
          <ChartTooltip
            cursor={{ fillOpacity: 0.5 }}
            content={<ChartTooltipContent labelFormatter={(_, p) => `${p?.[0]?.payload?.hour} h – ${(p?.[0]?.payload?.hour + 1) % 24} h`} />}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
            shape={(props: unknown) => {
              const { x, y, width, height, payload } = props as { x: number; y: number; width: number; height: number; payload: { value: number } }
              if (!height || height <= 0) return <g />
              const r = Math.min(4, width / 2, height)
              const peak = payload.value === max
              return (
                <path
                  d={`M${x},${y + height}V${y + r}a${r},${r} 0 0 1 ${r},${-r}H${x + width - r}a${r},${r} 0 0 1 ${r},${r}V${y + height}Z`}
                  fill="var(--color-value)"
                  fillOpacity={peak ? 1 : 0.45}
                />
              )
            }}
          />
        </BarChart>
      </ChartContainer>
      {empty && <EmptyOverlay />}
    </div>
  )
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const DAYS_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

/** Carte de chaleur jour × heure : rampe séquentielle à une seule teinte, avec légende d'échelle. */
export function WeekHeatmap({ data }: { data: number[][] }) {
  const max = Math.max(1, ...data.flat())
  const steps = [0, 0.15, 0.32, 0.52, 0.75, 1]
  const level = (v: number) => (v === 0 ? 0 : Math.max(1, Math.ceil((v / max) * (steps.length - 1))))
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-[2px]">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center text-[10px] text-muted-foreground tabular-nums">
              {h % 3 === 0 ? h : ""}
            </span>
          ))}
          {data.map((row, d) => (
            <div key={d} className="contents">
              <span className="pr-2 text-right text-[11px] leading-5 text-muted-foreground">{DAYS[d]}</span>
              {row.map((v, h) => (
                <Tooltip key={h}>
                  <TooltipTrigger asChild>
                    <span
                      className="h-5 rounded-[3px] transition-transform hover:scale-110 hover:ring-2 hover:ring-foreground/20"
                      style={{
                        background:
                          v === 0
                            ? "var(--muted)"
                            : `color-mix(in oklch, var(--chart-1) ${Math.round(steps[level(v)] * 100)}%, var(--muted))`,
                      }}
                      aria-label={`${DAYS_LONG[d]} ${h} h : ${v} scans`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="capitalize">{DAYS_LONG[d]}</span> · {h} h – {(h + 1) % 24} h :{" "}
                    <strong>{formatNumber(v)}</strong> scan{v > 1 ? "s" : ""}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        Moins
        {steps.map((s, i) => (
          <span
            key={i}
            className="size-3 rounded-[3px]"
            style={{ background: i === 0 ? "var(--muted)" : `color-mix(in oklch, var(--chart-1) ${Math.round(s * 100)}%, var(--muted))` }}
          />
        ))}
        Plus
      </div>
    </div>
  )
}

function EmptyOverlay() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="rounded-full border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
        Aucun scan sur la période
      </span>
    </div>
  )
}

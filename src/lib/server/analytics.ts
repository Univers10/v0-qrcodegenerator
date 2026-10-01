import "server-only"

import { and, countDistinct, count, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm"

import { db } from "@/lib/db"
import { qrCode, scan } from "@/lib/db/schema"

export const TIME_ZONE = process.env.APP_TIMEZONE ?? "Europe/Paris"

export const RANGES = {
  "7d": { days: 7, label: "7 derniers jours" },
  "30d": { days: 30, label: "30 derniers jours" },
  "90d": { days: 90, label: "90 derniers jours" },
  "365d": { days: 365, label: "12 derniers mois" },
} as const

export type RangeKey = keyof typeof RANGES

export function parseRange(value: string | string[] | undefined): RangeKey {
  return typeof value === "string" && value in RANGES ? (value as RangeKey) : "30d"
}

type Scope = { userId: string; qrCodeId?: string }

function scopeFilter({ userId, qrCodeId }: Scope, ...extra: (SQL | undefined)[]) {
  return and(eq(qrCode.userId, userId), qrCodeId ? eq(scan.qrCodeId, qrCodeId) : undefined, ...extra)
}

const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
const partsFormatter = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "2-digit", hourCycle: "h23", weekday: "short" })
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

async function breakdown(scope: Scope, since: Date, column: typeof scan.device | typeof scan.os | typeof scan.browser | typeof scan.country | typeof scan.city, limit = 8) {
  const rows = await db
    .select({ key: column, value: count() })
    .from(scan)
    .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
    .where(scopeFilter(scope, gte(scan.createdAt, since)))
    .groupBy(column)
    .orderBy(desc(count()))
    .limit(limit)
  return rows.map((r) => ({ key: r.key ?? "Inconnu", value: r.value }))
}

export async function getAnalytics(scope: Scope, range: RangeKey) {
  const { days } = RANGES[range]
  const now = new Date()
  const since = new Date(now.getTime() - days * 86_400_000)
  const previousSince = new Date(since.getTime() - days * 86_400_000)

  const [[totals], [previous], buckets, devices, os, browsers, countries, cities] = await Promise.all([
    db
      .select({ scans: count(), uniques: countDistinct(scan.visitorHash) })
      .from(scan)
      .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
      .where(scopeFilter(scope, gte(scan.createdAt, since))),
    db
      .select({ scans: count(), uniques: countDistinct(scan.visitorHash) })
      .from(scan)
      .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
      .where(scopeFilter(scope, gte(scan.createdAt, previousSince), lt(scan.createdAt, since))),
    // Agrégation horaire en SQL, puis conversion dans le fuseau de l'application.
    db
      .select({ bucket: sql<number>`${scan.createdAt} / 3600000`.as("bucket"), value: count() })
      .from(scan)
      .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
      .where(scopeFilter(scope, gte(scan.createdAt, since)))
      .groupBy(sql`bucket`),
    breakdown(scope, since, scan.device),
    breakdown(scope, since, scan.os),
    breakdown(scope, since, scan.browser),
    breakdown(scope, since, scan.country, 10),
    breakdown(scope, since, scan.city, 10),
  ])

  // Série quotidienne complète (jours sans scan inclus)
  const daily = new Map<string, number>()
  // days + 1 jours calendaires : la fenêtre glissante couvre aussi le jour partiel le plus ancien,
  // la somme de la courbe est donc égale au total affiché.
  for (let i = days; i >= 0; i--) daily.set(dayFormatter.format(new Date(now.getTime() - i * 86_400_000)), 0)

  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, value: 0 }))
  const heatmap = WEEKDAYS.map(() => Array.from({ length: 24 }, () => 0))

  for (const { bucket, value } of buckets) {
    const date = new Date(Math.floor(Number(bucket)) * 3_600_000)
    const day = dayFormatter.format(date)
    if (daily.has(day)) daily.set(day, daily.get(day)! + value)
    const parts = partsFormatter.formatToParts(date)
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24
    const weekday = WEEKDAYS.indexOf(parts.find((p) => p.type === "weekday")?.value ?? "Mon")
    hours[hour].value += value
    if (weekday >= 0) heatmap[weekday][hour] += value
  }

  // Au-delà de 90 jours, on regroupe par semaine pour garder un graphique lisible.
  let series = Array.from(daily, ([date, value]) => ({ date, value }))
  if (days > 90) {
    const weekly: { date: string; value: number }[] = []
    series.forEach((point, i) => {
      if (i % 7 === 0) weekly.push({ ...point })
      else weekly[weekly.length - 1].value += point.value
    })
    series = weekly
  }

  return {
    range,
    days,
    granularity: days > 90 ? ("week" as const) : ("day" as const),
    totals: {
      scans: totals?.scans ?? 0,
      uniques: totals?.uniques ?? 0,
      previousScans: previous?.scans ?? 0,
      previousUniques: previous?.uniques ?? 0,
    },
    series,
    hours,
    heatmap,
    devices,
    os,
    browsers,
    countries,
    cities: cities.filter((c) => c.key !== "Inconnu"),
  }
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>

export async function getTopCodes(userId: string, range: RangeKey, limit = 5) {
  const since = new Date(Date.now() - RANGES[range].days * 86_400_000)
  return db
    .select({ id: qrCode.id, name: qrCode.name, type: qrCode.type, scans: count(scan.id) })
    .from(qrCode)
    .innerJoin(scan, and(eq(scan.qrCodeId, qrCode.id), gte(scan.createdAt, since)))
    .where(eq(qrCode.userId, userId))
    .groupBy(qrCode.id)
    .orderBy(desc(count(scan.id)))
    .limit(limit)
}

export async function getRecentScans(scope: Scope, limit = 8) {
  return db
    .select({
      id: scan.id,
      createdAt: scan.createdAt,
      device: scan.device,
      os: scan.os,
      browser: scan.browser,
      country: scan.country,
      city: scan.city,
      qrCodeId: qrCode.id,
      qrName: qrCode.name,
    })
    .from(scan)
    .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
    .where(scopeFilter(scope))
    .orderBy(desc(scan.createdAt))
    .limit(limit)
}

export async function getScansForExport(scope: Scope, since?: Date) {
  return db
    .select({
      date: scan.createdAt,
      qrName: qrCode.name,
      device: scan.device,
      os: scan.os,
      browser: scan.browser,
      country: scan.country,
      city: scan.city,
      referer: scan.referer,
      visitor: scan.visitorHash,
    })
    .from(scan)
    .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
    .where(scopeFilter(scope, since ? gte(scan.createdAt, since) : undefined))
    .orderBy(desc(scan.createdAt))
}

export async function getWorkspaceStats(userId: string) {
  const since = new Date(Date.now() - 30 * 86_400_000)
  const [[codes], [scans]] = await Promise.all([
    db.select({ value: count() }).from(qrCode).where(eq(qrCode.userId, userId)),
    db
      .select({ value: count() })
      .from(scan)
      .innerJoin(qrCode, eq(scan.qrCodeId, qrCode.id))
      .where(and(eq(qrCode.userId, userId), gte(scan.createdAt, since))),
  ])
  return { codes: codes?.value ?? 0, scans30d: scans?.value ?? 0 }
}

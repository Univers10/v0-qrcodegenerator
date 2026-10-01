import "server-only"

import { createHash, randomUUID } from "node:crypto"

import { db } from "@/lib/db"
import { scan } from "@/lib/db/schema"
import { incrementScanCount } from "./qr-service"

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp\/|telegrambot|discordbot|headless|lighthouse|monitor|curl|wget|python-requests/i

export function isBot(ua: string) {
  return !ua || BOT_PATTERN.test(ua)
}

/** Analyse légère de l'agent utilisateur (sans dépendance externe). */
export function parseUserAgent(ua: string) {
  const device = /ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(ua)
    ? "Tablette"
    : /mobi|iphone|ipod|android|windows phone|blackberry|opera mini/i.test(ua)
      ? "Mobile"
      : "Ordinateur"

  const os = /iphone|ipad|ipod|ios/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /windows/i.test(ua)
        ? "Windows"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /cros/i.test(ua)
            ? "ChromeOS"
            : /linux/i.test(ua)
              ? "Linux"
              : "Autre"

  const browser = /edg(e|a|ios)?\//i.test(ua)
    ? "Edge"
    : /samsungbrowser/i.test(ua)
      ? "Samsung Internet"
      : /opr\/|opera/i.test(ua)
        ? "Opera"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /crios|chrome|chromium/i.test(ua)
            ? "Chrome"
            : /safari/i.test(ua)
              ? "Safari"
              : "Autre"

  return { device, os, browser }
}

function header(headers: Headers, ...names: string[]) {
  for (const name of names) {
    const value = headers.get(name)
    if (value) return value
  }
  return null
}

function safeDecode(value: string | null) {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function recordScan(qrCodeId: string, headers: Headers) {
  const ua = headers.get("user-agent") ?? ""
  if (isBot(ua)) return

  const ip = header(headers, "x-real-ip", "cf-connecting-ip", "x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0"
  const now = new Date()
  const day = now.toISOString().slice(0, 10)
  // L'IP n'est jamais stockée : seule une empreinte salée et quotidienne est conservée.
  const visitorHash = createHash("sha256")
    .update(`${process.env.BETTER_AUTH_SECRET ?? "qrc"}|${day}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32)

  const country = header(headers, "x-vercel-ip-country", "cf-ipcountry", "x-country-code")
  const city = safeDecode(header(headers, "x-vercel-ip-city", "cf-ipcity"))
  const referer = headers.get("referer")

  await db.insert(scan).values({
    id: randomUUID(),
    qrCodeId,
    createdAt: now,
    ...parseUserAgent(ua),
    country: country && country !== "XX" ? country.toUpperCase() : null,
    city,
    referer: referer ? referer.slice(0, 300) : null,
    visitorHash,
  })
  await incrementScanCount(qrCodeId, now)
}

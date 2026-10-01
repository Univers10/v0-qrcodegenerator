import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z\d]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "qr-code"
  )
}

const numberFormatter = new Intl.NumberFormat("fr-FR")
export const formatNumber = (n: number) => numberFormatter.format(n)

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["fr"], { type: "region" }) : null
export function countryName(code: string | null) {
  if (!code || code === "Inconnu") return "Inconnu"
  try {
    return regionNames?.of(code) ?? code
  } catch {
    return code
  }
}

export function countryFlag(code: string | null) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return "🌐"
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)))
}

export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ...options }).format(new Date(date))
}

export function timeAgo(date: Date | string | number) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" })
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute")
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour")
  if (diff < 2592000) return rtf.format(-Math.round(diff / 86400), "day")
  return formatDate(date)
}

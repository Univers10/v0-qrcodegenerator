import { z } from "zod"

import { countItems, defaultMenu, menuSchema } from "./menu"

/* ------------------------------------------------------------------ */
/* Schémas de contenu par type de QR code                              */
/* ------------------------------------------------------------------ */

const optional = z.string().trim().max(2000).optional().default("")

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .default("")
  .refine((v) => !v || isValidUrl(normalizeUrl(v)), "Adresse web invalide")

const coordinate = (limit: number, message: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(String(v).replace(",", "."))),
    z.number(message).min(-limit, message).max(limit, message),
  )

export const contentSchemas = {
  url: z.object({
    url: z
      .string()
      .trim()
      .min(1, "Saisissez une adresse web")
      .max(2048)
      .refine((v) => isValidUrl(normalizeUrl(v)), "Adresse web invalide"),
  }),
  text: z.object({
    text: z.string().trim().min(1, "Saisissez un texte").max(1500, "1 500 caractères maximum"),
  }),
  email: z.object({
    email: z.email("Adresse email invalide"),
    subject: optional,
    body: optional,
  }),
  phone: z.object({
    phone: z.string().trim().regex(/^\+?[\d\s().-]{4,24}$/, "Numéro invalide"),
  }),
  sms: z.object({
    phone: z.string().trim().regex(/^\+?[\d\s().-]{4,24}$/, "Numéro invalide"),
    message: optional,
  }),
  whatsapp: z.object({
    phone: z.string().trim().regex(/^\+?[\d\s().-]{6,24}$/, "Numéro international requis (ex. +33…)"),
    message: optional,
  }),
  wifi: z.object({
    ssid: z.string().trim().min(1, "Nom du réseau requis").max(64),
    password: z.string().max(128).optional().default(""),
    encryption: z.enum(["WPA", "WEP", "nopass"]).default("WPA"),
    hidden: z.boolean().default(false),
  }),
  vcard: z
    .object({
      firstName: optional,
      lastName: optional,
      organization: optional,
      title: optional,
      phone: optional,
      mobile: optional,
      email: z.union([z.literal(""), z.email("Adresse email invalide")]).optional().default(""),
      website: optionalUrl,
      street: optional,
      city: optional,
      zip: optional,
      country: optional,
      note: optional,
    })
    .refine((v) => v.firstName || v.lastName || v.organization, {
      message: "Indiquez au moins un nom ou une organisation",
      path: ["firstName"],
    }),
  location: z.object({
    latitude: coordinate(90, "Latitude invalide"),
    longitude: coordinate(180, "Longitude invalide"),
    label: optional,
  }),
  event: z
    .object({
      title: z.string().trim().min(1, "Titre requis").max(200),
      location: optional,
      start: z.string().min(1, "Date de début requise"),
      end: z.string().min(1, "Date de fin requise"),
      description: optional,
    })
    .refine((v) => new Date(v.end) >= new Date(v.start), {
      message: "La fin doit être après le début",
      path: ["end"],
    }),
  menu: menuSchema,
} as const

export type QrType = keyof typeof contentSchemas
export type QrContent<T extends QrType = QrType> = z.output<(typeof contentSchemas)[T]>

export const QR_TYPES = Object.keys(contentSchemas) as QrType[]

export function isQrType(value: string): value is QrType {
  return value in contentSchemas
}

/* ------------------------------------------------------------------ */
/* Valeurs initiales                                                   */
/* ------------------------------------------------------------------ */

export function defaultContent(type: QrType): Record<string, unknown> {
  switch (type) {
    case "url":
      return { url: "" }
    case "text":
      return { text: "" }
    case "email":
      return { email: "", subject: "", body: "" }
    case "phone":
      return { phone: "" }
    case "sms":
    case "whatsapp":
      return { phone: "", message: "" }
    case "wifi":
      return { ssid: "", password: "", encryption: "WPA", hidden: false }
    case "vcard":
      return {
        firstName: "",
        lastName: "",
        organization: "",
        title: "",
        phone: "",
        mobile: "",
        email: "",
        website: "",
        street: "",
        city: "",
        zip: "",
        country: "",
        note: "",
      }
    case "location":
      return { latitude: "", longitude: "", label: "" }
    case "event": {
      const start = new Date()
      start.setDate(start.getDate() + 7)
      start.setHours(18, 0, 0, 0)
      const end = new Date(start)
      end.setHours(20)
      return { title: "", location: "", start: toLocalInput(start), end: toLocalInput(end), description: "" }
    }
    case "menu":
      return defaultMenu()
  }
}

export type ParseResult =
  | { success: true; data: QrContent }
  | { success: false; errors: Record<string, string> }

export function parseContent(type: QrType, input: unknown): ParseResult {
  const result = contentSchemas[type].safeParse(input)
  if (result.success) return { success: true, data: result.data as QrContent }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    // Chemin complet (ex. « sections.0.items.2.name ») pour les contenus imbriqués comme les menus.
    const key = issue.path.length ? issue.path.map(String).join(".") : "_"
    errors[key] ??= issue.message
  }
  return { success: false, errors }
}

/* ------------------------------------------------------------------ */
/* Encodage dans la charge utile du QR code                            */
/* ------------------------------------------------------------------ */

export function normalizeUrl(value: string): string {
  const v = value.trim()
  if (!v) return v
  return /^[a-z][a-z\d+.-]*:/i.test(v) ? v : `https://${v}`
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value)
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".")
  } catch {
    return false
  }
}

const digits = (phone: string) => phone.replace(/[^\d+]/g, "")

/** Échappement des caractères spéciaux du format WIFI: */
const escapeWifi = (v: string) => v.replace(/([\\;,:"])/g, "\\$1")

/** Échappement des valeurs vCard / iCalendar */
const escapeIcs = (v: string) => v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1")

/**
 * Les dates d'événement sont des heures « murales » (champ datetime-local, sans fuseau).
 * On les encode en heure flottante iCalendar (sans « Z ») : chaque agenda les interprète
 * dans le fuseau de l'appareil, ce qui correspond à un événement sur place.
 */
export function toIcsDate(local: string) {
  const [date, time = "00:00"] = local.split("T")
  return `${date.replace(/-/g, "")}T${time.replace(/:/g, "").padEnd(6, "0").slice(0, 6)}`
}

/** Formate une heure murale sans conversion de fuseau. */
export function formatWallTime(local: string, options: Intl.DateTimeFormatOptions = { dateStyle: "full", timeStyle: "short" }) {
  return new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "UTC" }).format(new Date(`${local.slice(0, 16)}:00Z`))
}

export function buildVCard(c: QrContent<"vcard">) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeIcs(c.lastName)};${escapeIcs(c.firstName)};;;`,
    `FN:${escapeIcs([c.firstName, c.lastName].filter(Boolean).join(" ") || c.organization)}`,
  ]
  if (c.organization) lines.push(`ORG:${escapeIcs(c.organization)}`)
  if (c.title) lines.push(`TITLE:${escapeIcs(c.title)}`)
  if (c.phone) lines.push(`TEL;TYPE=WORK,VOICE:${digits(c.phone)}`)
  if (c.mobile) lines.push(`TEL;TYPE=CELL:${digits(c.mobile)}`)
  if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${c.email}`)
  if (c.website) lines.push(`URL:${normalizeUrl(c.website)}`)
  if (c.street || c.city || c.zip || c.country)
    lines.push(`ADR;TYPE=WORK:;;${escapeIcs(c.street)};${escapeIcs(c.city)};;${escapeIcs(c.zip)};${escapeIcs(c.country)}`)
  if (c.note) lines.push(`NOTE:${escapeIcs(c.note)}`)
  lines.push("END:VCARD")
  return lines.join("\r\n")
}

export function buildEvent(c: QrContent<"event">, { calendar = false } = {}) {
  const event = [
    "BEGIN:VEVENT",
    `SUMMARY:${escapeIcs(c.title)}`,
    `DTSTART:${toIcsDate(c.start)}`,
    `DTEND:${toIcsDate(c.end)}`,
  ]
  if (c.location) event.push(`LOCATION:${escapeIcs(c.location)}`)
  if (c.description) event.push(`DESCRIPTION:${escapeIcs(c.description)}`)
  event.push("END:VEVENT")
  if (!calendar) return event.join("\r\n")
  const uid = `${toIcsDate(c.start)}-${Math.random().toString(36).slice(2)}@qrcreator`
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UNIVERS10//QR Creator//FR",
    ...event.slice(0, 1),
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    ...event.slice(1),
    "END:VCALENDAR",
  ].join("\r\n")
}

export function mapsUrl(c: QrContent<"location">) {
  return `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`
}

export function whatsappUrl(c: QrContent<"whatsapp">) {
  const phone = digits(c.phone).replace(/^\+/, "")
  return `https://wa.me/${phone}${c.message ? `?text=${encodeURIComponent(c.message)}` : ""}`
}

/** Charge utile brute (QR statique, ou destination finale d'un QR dynamique). */
export function encodeContent(type: QrType, data: QrContent): string {
  switch (type) {
    case "url":
      return normalizeUrl((data as QrContent<"url">).url)
    case "text":
      return (data as QrContent<"text">).text
    case "email": {
      const c = data as QrContent<"email">
      const params = new URLSearchParams()
      if (c.subject) params.set("subject", c.subject)
      if (c.body) params.set("body", c.body)
      const qs = params.toString().replace(/\+/g, "%20")
      return `mailto:${c.email}${qs ? `?${qs}` : ""}`
    }
    case "phone":
      return `tel:${digits((data as QrContent<"phone">).phone)}`
    case "sms": {
      const c = data as QrContent<"sms">
      return `SMSTO:${digits(c.phone)}:${c.message}`
    }
    case "whatsapp":
      return whatsappUrl(data as QrContent<"whatsapp">)
    case "wifi": {
      const c = data as QrContent<"wifi">
      const pass = c.encryption === "nopass" ? "" : `P:${escapeWifi(c.password)};`
      return `WIFI:T:${c.encryption};S:${escapeWifi(c.ssid)};${pass}${c.hidden ? "H:true;" : ""};`
    }
    case "vcard":
      return buildVCard(data as QrContent<"vcard">)
    case "location":
      return mapsUrl(data as QrContent<"location">)
    case "event":
      return buildEvent(data as QrContent<"event">)
    case "menu":
      // Un menu n'existe que sous forme dynamique : la page est servie par /p/{code}.
      return ""
  }
}

/** Types qui n'ont de sens qu'en QR dynamique (le contenu vit sur une page web). */
export const DYNAMIC_ONLY_TYPES: QrType[] = ["menu"]

/** Capacité maximale (octets, mode binaire, version 40) selon le niveau de correction. */
const QR_CAPACITY = { L: 2953, M: 2331, Q: 1663, H: 1273 } as const

/** Vérifie qu'une charge utile tient dans un QR code au niveau de correction donné. */
export function fitsInQr(payload: string, level: keyof typeof QR_CAPACITY) {
  return new TextEncoder().encode(payload).length <= QR_CAPACITY[level]
}

/** Types redirigés directement par /r/{code} ; les autres affichent une page mobile. */
export function redirectTarget(type: QrType, data: QrContent): string | null {
  if (type === "url" || type === "whatsapp" || type === "location") return encodeContent(type, data)
  return null
}

/** Résumé lisible du contenu, pour les listes et les cartes. */
export function summarizeContent(type: QrType, data: QrContent): string {
  const d = data as Record<string, unknown>
  switch (type) {
    case "url":
      return normalizeUrl(String(d.url ?? "")).replace(/^https?:\/\//, "")
    case "text":
      return String(d.text ?? "").slice(0, 80)
    case "email":
      return String(d.email ?? "")
    case "phone":
    case "sms":
    case "whatsapp":
      return String(d.phone ?? "")
    case "wifi":
      return `Réseau « ${d.ssid} »`
    case "vcard":
      return [d.firstName, d.lastName].filter(Boolean).join(" ") || String(d.organization ?? "")
    case "location":
      return String(d.label || `${d.latitude}, ${d.longitude}`)
    case "event":
      return String(d.title ?? "")
    case "menu": {
      const n = countItems(d as { sections?: { items?: unknown[] }[] })
      const name = String((d.restaurant as { name?: string } | undefined)?.name ?? "")
      return `${name || "Menu"} · ${n} plat${n > 1 ? "s" : ""}`
    }
  }
}

export function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

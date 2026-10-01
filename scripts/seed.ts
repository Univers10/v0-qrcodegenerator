/**
 * Jeu de données de démonstration : un compte, 9 QR codes et ~90 jours de scans réalistes.
 * Usage : npm run db:seed  (idempotent : le compte de démo est recréé à chaque exécution)
 *
 * Identifiants du compte de démonstration (environnement local uniquement) :
 *   email    : demo@qrcreator.local
 *   mot de passe : demo-qrcreator-2026
 */
import { createHash, randomUUID } from "node:crypto"
import { createClient } from "@libsql/client"
import { hashPassword } from "better-auth/crypto"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "../src/lib/db/schema"
import { applyTemplate, DEFAULT_DESIGN, DESIGN_TEMPLATES, type QrDesign } from "../src/lib/qr/design"

const DEMO_EMAIL = "demo@qrcreator.local"
const DEMO_PASSWORD = "demo-qrcreator-2026"

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:data/qr-creator.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const db = drizzle(client, { schema })

// Générateur pseudo-aléatoire déterministe (résultats reproductibles)
let seed = 42
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32
  return seed / 2 ** 32
}
const pick = <T>(entries: [T, number][]): T => {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [value, weight] of entries) if ((r -= weight) <= 0) return value
  return entries[0][0]
}

const template = (id: string, patch: Partial<QrDesign> = {}): QrDesign =>
  applyTemplate(applyTemplate(DEFAULT_DESIGN, DESIGN_TEMPLATES.find((t) => t.id === id)!.design), patch)

const frame = (text: string, color: string): Partial<QrDesign> => ({
  frame: { style: "bottom", text, color, textColor: "#ffffff" },
})

const CODES: {
  name: string
  type: string
  data: Record<string, unknown>
  design: QrDesign
  isDynamic: boolean
  status?: "active" | "paused"
  weight: number
  ageDays: number
}[] = [
  {
    name: "Menu — Le Bistrot des Halles",
    type: "url",
    data: { url: "https://bistrot-des-halles.fr/menu" },
    design: template("sunset", frame("MENU", "#ea580c")),
    isDynamic: true,
    weight: 9,
    ageDays: 88,
  },
  {
    name: "Carte de visite — Camille Martin",
    type: "vcard",
    data: {
      firstName: "Camille",
      lastName: "Martin",
      organization: "UNIVERS10",
      title: "Directrice commerciale",
      phone: "",
      mobile: "+33 6 12 34 56 78",
      email: "camille.martin@exemple.fr",
      website: "univers10.com",
      street: "12 rue de la Paix",
      city: "Paris",
      zip: "75002",
      country: "France",
      note: "",
    },
    design: template("ocean"),
    isDynamic: true,
    weight: 3,
    ageDays: 80,
  },
  {
    name: "Wi-Fi Boutique Opéra",
    type: "wifi",
    data: { ssid: "Boutique-Opera", password: "Bienvenue2026!", encryption: "WPA", hidden: false },
    design: template("forest", frame("WI-FI GRATUIT", "#14532d")),
    isDynamic: true,
    weight: 5,
    ageDays: 75,
  },
  {
    name: "Salon Tech & Innovation 2026",
    type: "event",
    data: {
      title: "Salon Tech & Innovation 2026",
      location: "Paris Expo, Porte de Versailles",
      start: "2026-11-18T09:00",
      end: "2026-11-20T18:00",
      description: "Trois jours de conférences et de démonstrations. Stand B42.",
    },
    design: template("indigo", { frame: { style: "pill", text: "AJOUTER À L'AGENDA", color: "#4338ca", textColor: "#ffffff" } }),
    isDynamic: true,
    weight: 4,
    ageDays: 40,
  },
  {
    name: "Avis clients — Google",
    type: "url",
    data: { url: "https://g.page/r/exemple-avis" },
    design: template("classic", frame("LAISSEZ UN AVIS", "#18181b")),
    isDynamic: true,
    weight: 4,
    ageDays: 85,
  },
  {
    name: "WhatsApp — Service client",
    type: "whatsapp",
    data: { phone: "+33 6 98 76 54 32", message: "Bonjour, j'ai une question sur ma commande." },
    design: template("candy"),
    isDynamic: true,
    weight: 3,
    ageDays: 60,
  },
  {
    name: "Showroom Paris",
    type: "location",
    data: { latitude: 48.8698, longitude: 2.3311, label: "Showroom UNIVERS10 — Opéra" },
    design: template("noir"),
    isDynamic: true,
    weight: 1.5,
    ageDays: 50,
  },
  {
    name: "Campagne affichage été (terminée)",
    type: "url",
    data: { url: "https://univers10.com/ete" },
    design: template("soft"),
    isDynamic: true,
    status: "paused",
    weight: 2,
    ageDays: 90,
  },
  {
    name: "Flyer — site vitrine",
    type: "url",
    data: { url: "https://univers10.com" },
    design: template("soft"),
    isDynamic: false,
    weight: 0,
    ageDays: 30,
  },
]

const GEO: [{ country: string; city: string }, number][] = [
  [{ country: "FR", city: "Paris" }, 34],
  [{ country: "FR", city: "Lyon" }, 9],
  [{ country: "FR", city: "Marseille" }, 6],
  [{ country: "FR", city: "Bordeaux" }, 4],
  [{ country: "FR", city: "Lille" }, 3],
  [{ country: "CI", city: "Abidjan" }, 8],
  [{ country: "BE", city: "Bruxelles" }, 6],
  [{ country: "CH", city: "Genève" }, 4],
  [{ country: "CA", city: "Montréal" }, 5],
  [{ country: "SN", city: "Dakar" }, 3],
  [{ country: "MA", city: "Casablanca" }, 3],
  [{ country: "DE", city: "Berlin" }, 2],
]
const HOURS = [1, 0.5, 0.3, 0.2, 0.3, 0.8, 2, 4, 6, 7, 7, 9, 12, 10, 7, 7, 8, 11, 14, 13, 10, 7, 4, 2]
const WEEKDAY = [1, 0.95, 1, 1.05, 1.25, 1.5, 1.1] // dim → sam

function device() {
  const kind = pick<"Mobile" | "Tablette" | "Ordinateur">([
    ["Mobile", 72],
    ["Tablette", 7],
    ["Ordinateur", 21],
  ])
  if (kind === "Ordinateur") {
    return { device: kind, os: pick([["Windows", 55], ["macOS", 38], ["Linux", 7]]), browser: pick([["Chrome", 58], ["Edge", 18], ["Safari", 14], ["Firefox", 10]]) }
  }
  const os = pick([["iOS", 56], ["Android", 44]])
  return { device: kind, os, browser: os === "iOS" ? pick([["Safari", 85], ["Chrome", 15]]) : pick([["Chrome", 72], ["Samsung Internet", 22], ["Firefox", 6]]) }
}

async function main() {
  const existing = await db.query.user.findFirst({ where: eq(schema.user.email, DEMO_EMAIL) })
  if (existing) await db.delete(schema.user).where(eq(schema.user.id, existing.id))

  const userId = randomUUID()
  const createdAt = new Date(Date.now() - 95 * 86_400_000)
  await db.insert(schema.user).values({ id: userId, name: "Camille Martin", email: DEMO_EMAIL, emailVerified: true, createdAt, updatedAt: createdAt })
  await db.insert(schema.account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(DEMO_PASSWORD),
    createdAt,
    updatedAt: createdAt,
  })

  const now = Date.now()
  let total = 0
  for (const [index, code] of CODES.entries()) {
    const id = randomUUID()
    const codeCreated = new Date(now - code.ageDays * 86_400_000)
    const scans: (typeof schema.scan.$inferInsert)[] = []
    // Les scans s'arrêtent 20 jours avant aujourd'hui pour le code en pause.
    const lastDay = code.status === "paused" ? 20 : 0

    for (let day = code.ageDays; day >= lastDay; day--) {
      const date = new Date(now - day * 86_400_000)
      const growth = 0.55 + ((code.ageDays - day) / code.ageDays) * 0.9
      const expected = code.weight * growth * WEEKDAY[date.getDay()] * (0.7 + rand() * 0.6)
      const count = Math.max(0, Math.round(expected))
      for (let i = 0; i < count; i++) {
        const hour = pick(HOURS.map((w, h) => [h, w] as [number, number]))
        const at = new Date(date)
        at.setHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0)
        if (at.getTime() > now) continue
        const geo = pick(GEO)
        // ~25 % de visiteurs récurrents dans la journée
        const visitor = rand() < 0.25 ? `${day}-returning-${Math.floor(rand() * 3)}` : randomUUID()
        scans.push({
          id: randomUUID(),
          qrCodeId: id,
          createdAt: at,
          ...device(),
          country: geo.country,
          city: geo.city,
          referer: null,
          visitorHash: createHash("sha256").update(`${id}${visitor}`).digest("hex").slice(0, 32),
        })
      }
    }

    const last = scans.reduce<Date | null>((max, s) => (!max || s.createdAt! > max ? s.createdAt! : max), null)
    await db.insert(schema.qrCode).values({
      id,
      userId,
      name: code.name,
      type: code.type,
      data: code.data,
      design: code.design,
      isDynamic: code.isDynamic,
      shortCode: `demo${index}${randomUUID().slice(0, 4)}`,
      status: code.status ?? "active",
      scanCount: scans.length,
      lastScannedAt: last,
      createdAt: codeCreated,
      updatedAt: codeCreated,
    })
    for (let i = 0; i < scans.length; i += 400) await db.insert(schema.scan).values(scans.slice(i, i + 400))
    total += scans.length
    console.log(`  • ${code.name} — ${scans.length} scans`)
  }

  console.log(`\n✓ Démo prête : ${CODES.length} QR codes, ${total} scans`)
  console.log(`  Connexion : ${DEMO_EMAIL} (mot de passe dans scripts/seed.ts)`)
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

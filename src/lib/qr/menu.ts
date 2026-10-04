import { z } from "zod"

/* ------------------------------------------------------------------ */
/* Menu de restaurant : modèle de données partagé client / serveur     */
/* ------------------------------------------------------------------ */

export const MENU_TAGS = [
  { value: "popular", label: "Coup de cœur" },
  { value: "new", label: "Nouveau" },
  { value: "vegetarian", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Sans gluten" },
  { value: "lactose-free", label: "Sans lactose" },
  { value: "spicy", label: "Épicé" },
  { value: "halal", label: "Halal" },
] as const

export type MenuTag = (typeof MENU_TAGS)[number]["value"]

/** Tags utilisables comme filtres de régime sur la page publique. */
export const DIET_TAGS: MenuTag[] = ["vegetarian", "vegan", "gluten-free", "lactose-free", "halal"]

export const CURRENCIES = [
  { value: "EUR", label: "Euro (€)" },
  { value: "XOF", label: "Franc CFA BCEAO (F CFA)" },
  { value: "XAF", label: "Franc CFA BEAC (FCFA)" },
  { value: "MAD", label: "Dirham marocain (MAD)" },
  { value: "CHF", label: "Franc suisse (CHF)" },
  { value: "CAD", label: "Dollar canadien ($ CA)" },
  { value: "USD", label: "Dollar américain ($)" },
  { value: "GBP", label: "Livre sterling (£)" },
] as const

export const MENU_THEMES = [
  { value: "modern", label: "Moderne", hint: "Clair et épuré", background: "#fafaf9", foreground: "#1c1917" },
  { value: "elegant", label: "Élégant", hint: "Sombre et raffiné", background: "#0c0a09", foreground: "#fafaf9" },
  { value: "bistro", label: "Bistrot", hint: "Chaleureux, papier crème", background: "#f6efe3", foreground: "#2b2118" },
] as const

export type MenuTheme = (typeof MENU_THEMES)[number]["value"]

/** Les images d'un menu sont des fichiers stockés par l'application (jamais d'URL externe). */
const assetUrl = z
  .string()
  .regex(/^\/api\/assets\/[\w-]{8,64}$/, "Image invalide")
  .nullable()
  .default(null)

const text = (max: number) => z.string().trim().max(max).optional().default("")

const price = z.preprocess(
  (v) => {
    if (v === "" || v === null || v === undefined) return null
    const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, "").replace(",", "."))
    return Number.isFinite(n) ? n : v
  },
  z.number("Prix invalide").min(0, "Prix invalide").max(100_000_000, "Prix invalide").nullable(),
)

export const menuItemSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().trim().min(1, "Nom du plat requis").max(80),
  description: text(300),
  price,
  image: assetUrl,
  tags: z.array(z.enum(MENU_TAGS.map((t) => t.value) as [MenuTag, ...MenuTag[]])).max(8).default([]),
  available: z.boolean().default(true),
})

export const menuSectionSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().trim().min(1, "Nom de la catégorie requis").max(60),
  description: text(200),
  items: z.array(menuItemSchema).min(1, "Ajoutez au moins un plat").max(80),
})

export const menuSchema = z.object({
  restaurant: z.object({
    name: z.string().trim().min(1, "Nom de l'établissement requis").max(80),
    tagline: text(120),
    logo: assetUrl,
    cover: assetUrl,
    phone: text(30),
    address: text(200),
    hours: text(200),
    website: text(200),
    wifiSsid: text(64),
    wifiPassword: text(128),
  }),
  currency: z.enum(CURRENCIES.map((c) => c.value) as [string, ...string[]]).default("EUR"),
  theme: z.enum(MENU_THEMES.map((t) => t.value) as [MenuTheme, ...MenuTheme[]]).default("modern"),
  accent: z.string().regex(/^#[\da-f]{6}$/i, "Couleur invalide").default("#b45309"),
  note: text(300),
  sections: z.array(menuSectionSchema).min(1, "Ajoutez au moins une catégorie").max(30),
})

export type MenuData = z.output<typeof menuSchema>
export type MenuSection = MenuData["sections"][number]
export type MenuItem = MenuSection["items"][number]

/** Identifiant court pour les éléments de menu (côté client). */
export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function emptyItem(): Record<string, unknown> {
  return { id: newId(), name: "", description: "", price: "", image: null, tags: [], available: true }
}

export function emptySection(name = ""): Record<string, unknown> {
  return { id: newId(), name, description: "", items: [emptyItem()] }
}

export function defaultMenu(): Record<string, unknown> {
  return {
    restaurant: {
      name: "",
      tagline: "",
      logo: null,
      cover: null,
      phone: "",
      address: "",
      hours: "",
      website: "",
      wifiSsid: "",
      wifiPassword: "",
    },
    currency: "EUR",
    theme: "modern",
    accent: "#b45309",
    note: "Prix nets, service compris. Informations sur les allergènes disponibles sur demande.",
    sections: [emptySection("Entrées")],
  }
}

/**
 * Menu d'exemple complet pour démarrer en un clic.
 * `makeId` permet des identifiants stables (rendu serveur de la démo sur la page d'accueil).
 */
export function sampleMenu(makeId: () => string = newId): Record<string, unknown> {
  const item = (name: string, description: string, price: number, tags: MenuTag[] = []) => ({
    id: makeId(),
    name,
    description,
    price,
    image: null,
    tags,
    available: true,
  })
  return {
    ...defaultMenu(),
    restaurant: {
      name: "Le Bistrot des Halles",
      tagline: "Cuisine de marché, produits frais et vins nature",
      logo: null,
      cover: null,
      phone: "+33 1 42 00 00 00",
      address: "12 rue Montorgueil, 75002 Paris",
      hours: "Mar – Sam · 12 h – 14 h 30 et 19 h – 22 h 30",
      website: "",
      wifiSsid: "Bistrot-Invites",
      wifiPassword: "bonappetit",
    },
    sections: [
      {
        id: makeId(),
        name: "Entrées",
        description: "",
        items: [
          item("Velouté de potimarron", "Crème de noisette torréfiée, croûtons au thym", 9, ["vegetarian", "gluten-free"]),
          item("Œuf parfait", "Crème de champignons, lard fumé croustillant", 11, ["popular"]),
          item("Tartare de daurade", "Agrumes, gingembre, huile de sésame", 13),
        ],
      },
      {
        id: makeId(),
        name: "Plats",
        description: "Servis avec un accompagnement de saison",
        items: [
          item("Suprême de volaille fermière", "Jus réduit, purée maison au beurre", 21, ["popular"]),
          item("Risotto aux cèpes", "Parmesan 24 mois, roquette", 19, ["vegetarian", "new"]),
          item("Pavé de bœuf, sauce au poivre", "Frites fraîches, salade verte", 26),
          item("Curry de légumes", "Lait de coco, riz basmati, coriandre", 17, ["vegan", "spicy", "gluten-free"]),
        ],
      },
      {
        id: makeId(),
        name: "Desserts",
        description: "",
        items: [
          item("Tarte fine aux pommes", "Caramel au beurre salé, glace vanille", 9, ["vegetarian"]),
          item("Mousse au chocolat noir", "Fleur de sel, éclats de noisette", 8, ["vegetarian", "gluten-free"]),
        ],
      },
      {
        id: makeId(),
        name: "Boissons",
        description: "",
        items: [
          item("Citronnade maison", "Citron, menthe fraîche", 5, ["vegan"]),
          item("Verre de vin nature", "Sélection du moment, 12 cl", 7),
          item("Café / thé", "", 2.5, ["vegan"]),
        ],
      },
    ],
  }
}

const formatters = new Map<string, Intl.NumberFormat>()

export function formatPrice(value: number | null, currency: string) {
  if (value === null || value === undefined) return ""
  let f = formatters.get(currency)
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      // Le franc CFA n'a pas de subdivision : pas de décimales.
      minimumFractionDigits: currency === "XOF" || currency === "XAF" ? 0 : undefined,
      maximumFractionDigits: currency === "XOF" || currency === "XAF" ? 0 : 2,
    })
    formatters.set(currency, f)
  }
  return f.format(value)
}

export function countItems(menu: { sections?: { items?: unknown[] }[] }) {
  return (menu.sections ?? []).reduce((sum, s) => sum + (s.items?.length ?? 0), 0)
}

/** Identifiants des images utilisées par un menu (pour le nettoyage des fichiers orphelins). */
export function menuAssetIds(menu: MenuData) {
  const urls = [menu.restaurant.logo, menu.restaurant.cover, ...menu.sections.flatMap((s) => s.items.map((i) => i.image))]
  return urls.filter((u): u is string => Boolean(u)).map((u) => u.split("/").pop()!)
}

/* ------------------------------------------------------------------ */
/* Normalisation tolérante pour l'affichage (aperçu d'un menu en cours) */
/* ------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const asset = (v: unknown) => (typeof v === "string" && v.startsWith("/api/assets/") ? v : null)
const num = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null
  const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, "").replace(",", "."))
  return Number.isFinite(n) && n >= 0 ? n : null
}
const TAG_VALUES = new Set<string>(MENU_TAGS.map((t) => t.value))

/** Convertit n'importe quelle saisie (même incomplète) en menu affichable, sans jamais lever d'erreur. */
export function toViewMenu(raw: unknown): MenuData {
  const r = (raw ?? {}) as Record<string, unknown>
  const resto = (r.restaurant ?? {}) as Record<string, unknown>
  const sections = Array.isArray(r.sections) ? (r.sections as Record<string, unknown>[]) : []
  const currency = CURRENCIES.some((c) => c.value === r.currency) ? String(r.currency) : "EUR"
  const theme = MENU_THEMES.some((t) => t.value === r.theme) ? (r.theme as MenuTheme) : "modern"
  return {
    restaurant: {
      name: str(resto.name),
      tagline: str(resto.tagline),
      logo: asset(resto.logo),
      cover: asset(resto.cover),
      phone: str(resto.phone),
      address: str(resto.address),
      hours: str(resto.hours),
      website: str(resto.website),
      wifiSsid: str(resto.wifiSsid),
      wifiPassword: typeof resto.wifiPassword === "string" ? resto.wifiPassword : "",
    },
    currency,
    theme,
    accent: typeof r.accent === "string" && /^#[\da-f]{6}$/i.test(r.accent) ? r.accent : "#b45309",
    note: str(r.note),
    sections: sections
      .map((s, si) => ({
        id: str(s.id) || `s${si}`,
        name: str(s.name),
        description: str(s.description),
        items: (Array.isArray(s.items) ? (s.items as Record<string, unknown>[]) : [])
          .map((i, ii) => ({
            id: str(i.id) || `s${si}i${ii}`,
            name: str(i.name),
            description: str(i.description),
            price: num(i.price),
            image: asset(i.image),
            tags: (Array.isArray(i.tags) ? i.tags : []).filter((t): t is MenuTag => TAG_VALUES.has(String(t))),
            available: i.available !== false,
          }))
          .filter((i) => i.name),
      }))
      .filter((s) => s.name && s.items.length > 0),
  }
}

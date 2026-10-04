import { z } from "zod"

/* ------------------------------------------------------------------ */
/* Menu de restaurant : modèle de données partagé client / serveur     */
/* ------------------------------------------------------------------ */

export const MENU_TAGS = [
  { value: "popular", label: "Coup de cœur", short: "♥" },
  { value: "new", label: "Nouveau", short: "N" },
  { value: "vegetarian", label: "Végétarien", short: "V" },
  { value: "vegan", label: "Vegan", short: "VG" },
  { value: "gluten-free", label: "Sans gluten", short: "SG" },
  { value: "lactose-free", label: "Sans lactose", short: "SL" },
  { value: "spicy", label: "Épicé", short: "🌶" },
  { value: "halal", label: "Halal", short: "H" },
] as const

export type MenuTag = (typeof MENU_TAGS)[number]["value"]

/** Tags utilisables comme filtres de régime sur la page publique. */
export const DIET_TAGS: MenuTag[] = ["vegetarian", "vegan", "gluten-free", "lactose-free", "halal"]

export const CURRENCIES = [
  // Afrique de l'Ouest et centrale
  { value: "XOF", label: "Franc CFA BCEAO", hint: "Côte d'Ivoire, Sénégal, Mali, Burkina, Bénin, Togo, Niger", region: "Afrique", decimals: 0 },
  { value: "XAF", label: "Franc CFA BEAC", hint: "Cameroun, Gabon, Congo, Tchad, Centrafrique", region: "Afrique", decimals: 0 },
  { value: "GNF", label: "Franc guinéen", hint: "Guinée", region: "Afrique", decimals: 0 },
  { value: "CDF", label: "Franc congolais", hint: "RD Congo", region: "Afrique", decimals: 0 },
  { value: "NGN", label: "Naira", hint: "Nigeria", region: "Afrique", decimals: 2 },
  { value: "GHS", label: "Cedi", hint: "Ghana", region: "Afrique", decimals: 2 },
  { value: "RWF", label: "Franc rwandais", hint: "Rwanda", region: "Afrique", decimals: 0 },
  { value: "MGA", label: "Ariary", hint: "Madagascar", region: "Afrique", decimals: 0 },
  // Maghreb
  { value: "MAD", label: "Dirham marocain", hint: "Maroc", region: "Maghreb", decimals: 2 },
  { value: "TND", label: "Dinar tunisien", hint: "Tunisie", region: "Maghreb", decimals: 2 },
  { value: "DZD", label: "Dinar algérien", hint: "Algérie", region: "Maghreb", decimals: 0 },
  // Europe et Amérique du Nord
  { value: "EUR", label: "Euro", hint: "France, Belgique, zone euro", region: "Europe & Amérique", decimals: 2 },
  { value: "CHF", label: "Franc suisse", hint: "Suisse", region: "Europe & Amérique", decimals: 2 },
  { value: "GBP", label: "Livre sterling", hint: "Royaume-Uni", region: "Europe & Amérique", decimals: 2 },
  { value: "CAD", label: "Dollar canadien", hint: "Canada", region: "Europe & Amérique", decimals: 2 },
  { value: "USD", label: "Dollar américain", hint: "États-Unis", region: "Europe & Amérique", decimals: 2 },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["value"]
export const DEFAULT_CURRENCY: CurrencyCode = "XOF"
const CURRENCY_CODES = CURRENCIES.map((c) => c.value) as unknown as [CurrencyCode, ...CurrencyCode[]]

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (CURRENCY_CODES as readonly string[]).includes(value)
}

/** Symbole affiché (ex. « F CFA », « € »). */
export function currencySymbol(currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).formatToParts(1).find((p) => p.type === "currency")?.value ?? currency
  } catch {
    return currency
  }
}

/**
 * Parités fixes officielles (franc CFA ↔ euro : 1 € = 655,957 F CFA ; XOF = XAF).
 * Elles permettent de convertir une carte sans recourir à un taux de change variable.
 */
const EUR_PER_UNIT: Partial<Record<CurrencyCode, number>> = { EUR: 1, XOF: 1 / 655.957, XAF: 1 / 655.957 }

export function canConvert(from: string, to: string) {
  return from !== to && from in EUR_PER_UNIT && to in EUR_PER_UNIT
}

/** Convertit un prix selon la parité fixe, arrondi au « prix rond » usuel de la devise cible. */
export function convertPrice(value: number, from: CurrencyCode, to: CurrencyCode) {
  const raw = (value * EUR_PER_UNIT[from]!) / EUR_PER_UNIT[to]!
  if (to === "XOF" || to === "XAF") return Math.max(50, Math.round(raw / 50) * 50)
  return Math.round(raw * 10) / 10
}

/**
 * Deux familles de mise en page :
 * - « app » : grandes photos et plats mis en avant (fast-casual, cafés, maquis…)
 * - « carte » : typographie raffinée et prix alignés, comme une carte imprimée haut de gamme
 */
export const MENU_THEMES = [
  { value: "modern", label: "Moderne", hint: "Photos en vedette", layout: "app", background: "#f7f7f5", foreground: "#18181b" },
  { value: "classic", label: "Classique", hint: "Carte gastronomique", layout: "carte", background: "#fdfcfa", foreground: "#1c1917" },
  { value: "bistro", label: "Bistrot", hint: "Papier crème, chaleureux", layout: "carte", background: "#f4ecdf", foreground: "#2b2118" },
  { value: "elegant", label: "Élégant", hint: "Sombre et raffiné", layout: "carte", background: "#0e0c0b", foreground: "#f5f1ea" },
] as const

export type MenuTheme = (typeof MENU_THEMES)[number]["value"]

export const MENU_ACCENTS = ["#b45309", "#9f1239", "#b91c1c", "#7c3aed", "#1d4ed8", "#0f766e", "#15803d", "#a58b52", "#18181b"]

/**
 * Images autorisées : fichiers importés (stockés par l'application) ou photos de démonstration
 * livrées avec le projet. Jamais d'URL externe.
 */
const IMAGE_PATTERN = /^(\/api\/assets\/[\w-]{8,64}|\/menu-demo\/[a-z-]+\.webp)$/
const imageUrl = z.string().regex(IMAGE_PATTERN, "Image invalide").nullable().default(null)

const text = (max: number) => z.string().trim().max(max).optional().default("")

const toNumber = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null
  const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, "").replace(",", "."))
  return Number.isFinite(n) ? n : v
}

const price = z.preprocess(toNumber, z.number("Prix invalide").min(0, "Prix invalide").max(100_000_000, "Prix invalide").nullable())

export const menuVariantSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().trim().min(1, "Libellé requis").max(30),
  price: z.preprocess(toNumber, z.number("Prix invalide").min(0, "Prix invalide").max(100_000_000)),
})

export const menuItemSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().trim().min(1, "Nom du plat requis").max(80),
  description: text(300),
  price,
  /** Déclinaisons de prix : verre / bouteille, tailles, formules… */
  variants: z.array(menuVariantSchema).max(5).default([]),
  image: imageUrl,
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
    cuisine: text(80),
    logo: imageUrl,
    cover: imageUrl,
    phone: text(30),
    address: text(200),
    hours: text(200),
    website: text(200),
    wifiSsid: text(64),
    wifiPassword: text(128),
  }),
  currency: z.enum(CURRENCY_CODES).default(DEFAULT_CURRENCY),
  theme: z.enum(MENU_THEMES.map((t) => t.value) as [MenuTheme, ...MenuTheme[]]).default("modern"),
  accent: z.string().regex(/^#[\da-f]{6}$/i, "Couleur invalide").default("#b45309"),
  note: text(300),
  sections: z.array(menuSectionSchema).min(1, "Ajoutez au moins une catégorie").max(30),
})

export type MenuData = z.output<typeof menuSchema>
export type MenuSection = MenuData["sections"][number]
export type MenuItem = MenuSection["items"][number]

export function themeLayout(theme: MenuTheme) {
  return MENU_THEMES.find((t) => t.value === theme)?.layout ?? "app"
}

/** Identifiant court pour les éléments de menu (côté client). */
export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function emptyItem(): Record<string, unknown> {
  return { id: newId(), name: "", description: "", price: "", variants: [], image: null, tags: [], available: true }
}

export function emptySection(name = ""): Record<string, unknown> {
  return { id: newId(), name, description: "", items: [emptyItem()] }
}

export function defaultMenu(): Record<string, unknown> {
  return {
    restaurant: {
      name: "",
      tagline: "",
      cuisine: "",
      logo: null,
      cover: null,
      phone: "",
      address: "",
      hours: "",
      website: "",
      wifiSsid: "",
      wifiPassword: "",
    },
    currency: DEFAULT_CURRENCY,
    theme: "modern",
    accent: "#b45309",
    note: "Prix nets, service compris. Informations sur les allergènes disponibles sur demande.",
    sections: [emptySection("Entrées")],
  }
}

/**
 * Menu d'exemple complet, avec photos, pour démarrer en un clic.
 * `makeId` permet des identifiants stables (rendu serveur de la démo sur la page d'accueil).
 */
export function sampleMenu(makeId: () => string = newId, currency: CurrencyCode = DEFAULT_CURRENCY): Record<string, unknown> {
  // Prix de référence en F CFA (tarifs réalistes d'un bistrot à Abidjan ou Dakar), convertis pour les autres devises.
  const p = (cfa: number) =>
    currency === "XOF" || currency === "XAF" ? cfa : canConvert("XOF", currency) ? convertPrice(cfa, "XOF", currency) : Math.round(cfa / 600)
  const item = (
    name: string,
    description: string,
    price: number | null,
    tags: MenuTag[] = [],
    image: string | null = null,
    variants: [string, number][] = [],
  ) => ({
    id: makeId(),
    name,
    description,
    price,
    variants: variants.map(([label, p]) => ({ id: makeId(), label, price: p })),
    image: image ? `/menu-demo/${image}.webp` : null,
    tags,
    available: true,
  })
  return {
    ...defaultMenu(),
    restaurant: {
      name: "Le Bistrot des Halles",
      tagline: "Cuisine de marché, produits frais et vins nature",
      cuisine: "Bistronomie · Français",
      logo: null,
      cover: "/menu-demo/cover.webp",
      phone: "+225 07 00 00 00 00",
      address: "Rue des Jardins, Cocody Deux-Plateaux, Abidjan",
      hours: "Mar – Sam · 12 h – 14 h 30, 19 h – 22 h 30",
      website: "",
      wifiSsid: "Bistrot-Invites",
      wifiPassword: "bonappetit",
    },
    currency,
    sections: [
      {
        id: makeId(),
        name: "Entrées",
        description: "",
        items: [
          item("Velouté de potimarron", "Crème de noisette torréfiée, graines de courge et feta", p(4500), ["vegetarian", "gluten-free"], "veloute"),
          item("Œuf poché, champignons poêlés", "Pain de campagne grillé, tomates cerises rôties", p(5000), ["popular", "vegetarian"], "oeuf"),
          item("Tartare de thon en cuillères", "Sauce ponzu, caviar d'aubergine, sésame", p(7500), ["new"], "tartare"),
        ],
      },
      {
        id: makeId(),
        name: "Plats",
        description: "Servis avec un accompagnement de saison",
        items: [
          item("Demi-coquelet rôti au romarin", "Jus corsé, salade de romaine au parmesan", p(12000), ["popular"], "volaille"),
          item("Risotto crémeux aux cèpes", "Parmesan affiné 24 mois, huile de truffe", p(10000), ["vegetarian"], "risotto"),
          item("Entrecôte grillée, frites maison", "Bœuf maturé, sauce au poivre de Kampot", p(15000), [], "steak"),
          item("Curry de légumes & dal", "Lait de coco, riz basmati, coriandre fraîche", p(8500), ["vegan", "spicy", "gluten-free"], "curry"),
        ],
      },
      {
        id: makeId(),
        name: "Desserts",
        description: "",
        items: [
          item("Tarte fine aux pommes", "Pâte sablée maison, cannelle, crème crue", p(4000), ["vegetarian", "popular"], "tarte"),
          item("Crème au chocolat noir", "Chantilly vanillée, framboises fraîches", p(3500), ["vegetarian", "gluten-free"], "mousse"),
        ],
      },
      {
        id: makeId(),
        name: "Boissons",
        description: "",
        items: [
          item("Citronnade maison", "Citrons pressés, menthe fraîche, sirop d'agave", p(2000), ["vegan"], "citronnade"),
          item("Vin rouge nature", "Côtes-du-Rhône, domaine du moment", null, [], "vin", [
            ["Verre 12 cl", p(4000)],
            ["Bouteille", p(20000)],
          ]),
          item("Café", "Torréfaction artisanale", null, ["vegan"], "cafe", [
            ["Expresso", p(1500)],
            ["Cappuccino", p(2500)],
          ]),
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
    // Le franc CFA (comme plusieurs devises africaines) n'a pas de subdivision : pas de décimales.
    const decimals = CURRENCIES.find((c) => c.value === currency)?.decimals ?? 2
    f = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals === 0 ? 0 : undefined,
      maximumFractionDigits: decimals,
    })
    formatters.set(currency, f)
  }
  return f.format(value)
}

/** Prix d'affichage court (« dès 7 € » pour les plats à déclinaisons). */
export function displayPrice(item: Pick<MenuItem, "price" | "variants">, currency: string) {
  if (item.price !== null) return formatPrice(item.price, currency)
  if (item.variants.length) return `dès ${formatPrice(Math.min(...item.variants.map((v) => v.price)), currency)}`
  return ""
}

export function countItems(menu: { sections?: { items?: unknown[] }[] }) {
  return (menu.sections ?? []).reduce((sum, s) => sum + (s.items?.length ?? 0), 0)
}

/* ------------------------------------------------------------------ */
/* Normalisation tolérante pour l'affichage (aperçu d'un menu en cours) */
/* ------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const image = (v: unknown) => (typeof v === "string" && IMAGE_PATTERN.test(v) ? v : null)
const num = (v: unknown) => {
  const n = toNumber(v)
  return typeof n === "number" && n >= 0 ? n : null
}
const TAG_VALUES = new Set<string>(MENU_TAGS.map((t) => t.value))

/** Convertit n'importe quelle saisie (même incomplète) en menu affichable, sans jamais lever d'erreur. */
export function toViewMenu(raw: unknown): MenuData {
  const r = (raw ?? {}) as Record<string, unknown>
  const resto = (r.restaurant ?? {}) as Record<string, unknown>
  const sections = Array.isArray(r.sections) ? (r.sections as Record<string, unknown>[]) : []
  const currency = isCurrency(r.currency) ? r.currency : DEFAULT_CURRENCY
  const theme = MENU_THEMES.some((t) => t.value === r.theme) ? (r.theme as MenuTheme) : "modern"
  return {
    restaurant: {
      name: str(resto.name),
      tagline: str(resto.tagline),
      cuisine: str(resto.cuisine),
      logo: image(resto.logo),
      cover: image(resto.cover),
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
            variants: (Array.isArray(i.variants) ? (i.variants as Record<string, unknown>[]) : [])
              .map((v, vi) => ({ id: str(v.id) || `v${vi}`, label: str(v.label), price: num(v.price) }))
              .filter((v): v is { id: string; label: string; price: number } => Boolean(v.label) && v.price !== null),
            image: image(i.image),
            tags: (Array.isArray(i.tags) ? i.tags : []).filter((t): t is MenuTag => TAG_VALUES.has(String(t))),
            available: i.available !== false,
          }))
          .filter((i) => i.name),
      }))
      .filter((s) => s.name && s.items.length > 0),
  }
}

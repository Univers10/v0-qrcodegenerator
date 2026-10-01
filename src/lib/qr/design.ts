import { z } from "zod"

const color = z.string().regex(/^#[\da-f]{6}$/i, "Couleur invalide")

export const DOT_STYLES = [
  { value: "square", label: "Carré" },
  { value: "rounded", label: "Arrondi" },
  { value: "extra-rounded", label: "Très arrondi" },
  { value: "dots", label: "Points" },
  { value: "classy", label: "Élégant" },
  { value: "classy-rounded", label: "Élégant arrondi" },
] as const

export const CORNER_SQUARE_STYLES = [
  { value: "square", label: "Carré" },
  { value: "extra-rounded", label: "Arrondi" },
  { value: "dot", label: "Cercle" },
  { value: "classy", label: "Feuille" },
] as const

export const CORNER_DOT_STYLES = [
  { value: "square", label: "Carré" },
  { value: "dot", label: "Cercle" },
  { value: "rounded", label: "Arrondi" },
  { value: "classy", label: "Feuille" },
] as const

export const FRAME_STYLES = [
  { value: "none", label: "Aucun" },
  { value: "bottom", label: "Bandeau bas" },
  { value: "top", label: "Bandeau haut" },
  { value: "pill", label: "Bulle" },
] as const

export const ERROR_LEVELS = [
  { value: "L", label: "L · 7 %", hint: "Données maximales" },
  { value: "M", label: "M · 15 %", hint: "Équilibré" },
  { value: "Q", label: "Q · 25 %", hint: "Robuste" },
  { value: "H", label: "H · 30 %", hint: "Idéal avec logo" },
] as const

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as unknown as [T[number]["value"], ...T[number]["value"][]]

export const designSchema = z.object({
  dots: z.object({
    style: z.enum(values(DOT_STYLES)),
    color,
    gradient: z
      .object({
        type: z.enum(["linear", "radial"]),
        to: color,
        rotation: z.number().min(0).max(360),
      })
      .nullable(),
  }),
  cornersSquare: z.object({ style: z.enum(values(CORNER_SQUARE_STYLES)), color }),
  cornersDot: z.object({ style: z.enum(values(CORNER_DOT_STYLES)), color }),
  background: z.object({ color, transparent: z.boolean() }),
  logo: z.object({
    // Image normalisée côté client (PNG/SVG en data URL, ~300 Ko max)
    src: z
      .string()
      .max(400_000, "Logo trop volumineux")
      .regex(/^data:image\/(png|jpeg|webp|svg\+xml);base64,/, "Format de logo invalide")
      .nullable(),
    size: z.number().min(0.1).max(0.5),
    margin: z.number().min(0).max(20),
    hideBackgroundDots: z.boolean(),
  }),
  frame: z.object({
    style: z.enum(values(FRAME_STYLES)),
    text: z.string().max(32),
    color,
    textColor: color,
  }),
  errorCorrection: z.enum(["L", "M", "Q", "H"]),
  margin: z.number().min(0).max(40),
})

export type QrDesign = z.infer<typeof designSchema>

export const DEFAULT_DESIGN: QrDesign = {
  dots: { style: "rounded", color: "#18181b", gradient: null },
  cornersSquare: { style: "extra-rounded", color: "#18181b" },
  cornersDot: { style: "dot", color: "#18181b" },
  background: { color: "#ffffff", transparent: false },
  logo: { src: null, size: 0.3, margin: 6, hideBackgroundDots: true },
  frame: { style: "none", text: "SCANNEZ-MOI", color: "#18181b", textColor: "#ffffff" },
  errorCorrection: "Q",
  margin: 12,
}

/** Modèles prêts à l'emploi (inspirés des bibliothèques des leaders du secteur). */
export const DESIGN_TEMPLATES: { id: string; name: string; design: Partial<QrDesign> }[] = [
  {
    id: "classic",
    name: "Classique",
    design: {
      dots: { style: "square", color: "#000000", gradient: null },
      cornersSquare: { style: "square", color: "#000000" },
      cornersDot: { style: "square", color: "#000000" },
      background: { color: "#ffffff", transparent: false },
    },
  },
  {
    id: "soft",
    name: "Doux",
    design: {
      dots: { style: "rounded", color: "#18181b", gradient: null },
      cornersSquare: { style: "extra-rounded", color: "#18181b" },
      cornersDot: { style: "dot", color: "#18181b" },
      background: { color: "#ffffff", transparent: false },
    },
  },
  {
    id: "indigo",
    name: "Indigo",
    design: {
      dots: { style: "classy-rounded", color: "#4f46e5", gradient: { type: "linear", to: "#a855f7", rotation: 45 } },
      cornersSquare: { style: "extra-rounded", color: "#4338ca" },
      cornersDot: { style: "dot", color: "#7c3aed" },
      background: { color: "#ffffff", transparent: false },
    },
  },
  {
    id: "sunset",
    name: "Coucher de soleil",
    design: {
      dots: { style: "dots", color: "#f97316", gradient: { type: "linear", to: "#db2777", rotation: 135 } },
      cornersSquare: { style: "extra-rounded", color: "#ea580c" },
      cornersDot: { style: "dot", color: "#be185d" },
      background: { color: "#fffaf5", transparent: false },
    },
  },
  {
    id: "ocean",
    name: "Océan",
    design: {
      dots: { style: "rounded", color: "#0369a1", gradient: { type: "radial", to: "#0891b2", rotation: 0 } },
      cornersSquare: { style: "dot", color: "#075985" },
      cornersDot: { style: "dot", color: "#0e7490" },
      background: { color: "#f0f9ff", transparent: false },
    },
  },
  {
    id: "forest",
    name: "Forêt",
    design: {
      dots: { style: "classy", color: "#166534", gradient: null },
      cornersSquare: { style: "classy", color: "#14532d" },
      cornersDot: { style: "classy", color: "#15803d" },
      background: { color: "#f7fee7", transparent: false },
    },
  },
  {
    id: "noir",
    name: "Nuit",
    design: {
      dots: { style: "extra-rounded", color: "#fafafa", gradient: null },
      cornersSquare: { style: "extra-rounded", color: "#fafafa" },
      cornersDot: { style: "dot", color: "#a5b4fc" },
      background: { color: "#09090b", transparent: false },
    },
  },
  {
    id: "candy",
    name: "Bonbon",
    design: {
      dots: { style: "dots", color: "#db2777", gradient: { type: "linear", to: "#7c3aed", rotation: 90 } },
      cornersSquare: { style: "dot", color: "#be185d" },
      cornersDot: { style: "dot", color: "#6d28d9" },
      background: { color: "#fdf2f8", transparent: false },
    },
  },
]

export function parseDesign(input: unknown): QrDesign {
  const result = designSchema.safeParse(input)
  if (result.success) return result.data
  // Fusion tolérante : on complète un design partiel ou ancien avec les valeurs par défaut.
  const merged = deepMerge(DEFAULT_DESIGN, (input ?? {}) as Partial<QrDesign>)
  const retry = designSchema.safeParse(merged)
  return retry.success ? retry.data : DEFAULT_DESIGN
}

export function applyTemplate(base: QrDesign, template: Partial<QrDesign>): QrDesign {
  return deepMerge(base, template)
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  const out = { ...base } as Record<string, unknown>
  for (const [key, value] of Object.entries(patch ?? {})) {
    const current = out[key]
    out[key] =
      value && typeof value === "object" && !Array.isArray(value) && current && typeof current === "object"
        ? deepMerge(current, value as never)
        : value
  }
  return out as T
}

/* ------------------------------------------------------------------ */
/* Lisibilité : contraste et risques de lecture                        */
/* ------------------------------------------------------------------ */

function luminance(hex: string) {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

export type ScanabilityLevel = "excellent" | "good" | "risky"

export function scanability(design: QrDesign): { level: ScanabilityLevel; score: number; issues: string[] } {
  const issues: string[] = []
  const bg = design.background.transparent ? "#ffffff" : design.background.color
  const fgColors = [design.dots.color, design.dots.gradient?.to, design.cornersSquare.color, design.cornersDot.color]
  const worst = Math.min(...fgColors.filter((c): c is string => Boolean(c)).map((c) => contrastRatio(c, bg)))
  let score = 100

  if (worst < 2.5) {
    score -= 55
    issues.push("Contraste trop faible entre le motif et le fond")
  } else if (worst < 4) {
    score -= 25
    issues.push("Contraste moyen : privilégiez un motif plus foncé")
  }
  if (luminance(design.dots.color) > luminance(bg)) {
    score -= 15
    issues.push("Motif clair sur fond sombre : certains lecteurs anciens peuvent échouer")
  }
  if (design.logo.src) {
    const capacity = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 }[design.errorCorrection]
    const covered = design.logo.size ** 2
    if (covered > capacity * 0.9) {
      score -= 30
      issues.push("Logo trop grand pour le niveau de correction choisi")
    } else if (design.errorCorrection === "L" || design.errorCorrection === "M") {
      score -= 10
      issues.push("Avec un logo, choisissez la correction Q ou H")
    }
  }
  if (design.margin < 4 && design.frame.style === "none") {
    score -= 10
    issues.push("Marge très réduite autour du QR code")
  }
  if (design.background.transparent) {
    score -= 5
    issues.push("Fond transparent : vérifiez le support d'impression")
  }

  score = Math.max(0, score)
  const level: ScanabilityLevel = score >= 85 ? "excellent" : score >= 60 ? "good" : "risky"
  return { level, score, issues }
}

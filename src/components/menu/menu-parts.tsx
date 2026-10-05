"use client"

import { Check, Clock, Copy, Search, UtensilsCrossed, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"

import type { MenuData, MenuItem, MenuTag } from "@/lib/qr/menu"
import { cn } from "@/lib/utils"
import { TAG_COLORS, TAG_ICONS, TAG_LABELS } from "./menu-tags"

/* Briques partagées par les mises en page du menu (app, carte, livraison). */

export function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#18181b" : "#ffffff"
}

export const fold = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

export type LayoutCtx = {
  menu: MenuData
  sections: MenuData["sections"]
  featured: MenuItem[]
  usedTags: MenuTag[]
  active: string
  links: { phone: string | null; map: string | null; website: string | null }
  goTo: (id: string) => void
  registerSection: (id: string) => (el: HTMLElement | null) => void
  onSelect: (item: MenuItem) => void
  openSheet: (sheet: "wifi" | "info") => void
  setNavEl: (el: HTMLDivElement | null) => void
  setTabsEl: (el: HTMLDivElement | null) => void
  uid: string
  search: {
    open: boolean
    setOpen: (v: boolean | ((v: boolean) => boolean)) => void
    query: string
    setQuery: (v: string) => void
    diets: MenuTag[]
    setDiets: (v: MenuTag[] | ((v: MenuTag[]) => MenuTag[])) => void
    availableDiets: MenuTag[]
    filtering: boolean
  }
}

export function Cover({ menu }: { menu: MenuData }) {
  if (menu.restaurant.cover)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={menu.restaurant.cover} alt="" className="absolute inset-0 size-full object-cover" />
  return <Placeholder accent={menu.accent} large />
}

export function Placeholder({ accent, large }: { accent: string; large?: boolean }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        background: `radial-gradient(120% 100% at 15% 0%, color-mix(in oklab, ${accent} 70%, white) 0%, ${accent} 50%, color-mix(in oklab, ${accent} 55%, black) 100%)`,
      }}
    >
      <UtensilsCrossed className={cn("text-white/25", large ? "size-24" : "size-10")} strokeWidth={1.25} />
    </div>
  )
}

export function Logo({ menu, className, carte }: { menu: MenuData; className?: string; carte?: boolean }) {
  const r = menu.restaurant
  if (r.logo)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={r.logo} alt={`Logo ${r.name}`} className={cn("shrink-0 bg-white object-cover", className)} />
  // Monogramme : initiales des mots significatifs (« Le Bistrot des Halles » → « BH »)
  const words = r.name.split(/\s+/).filter((w) => w.length > 3)
  const initials = (words.length ? words : r.name.split(/\s+/)).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "R"
  return (
    <span
      className={cn("grid shrink-0 place-items-center text-[19px] font-medium italic", !carte && "shadow-lg", className)}
      style={
        carte
          ? { color: menu.accent, fontFamily: "var(--m-display)", boxShadow: `inset 0 0 0 1px ${menu.accent}, inset 0 0 0 4px var(--m-bg), inset 0 0 0 5px ${menu.accent}` }
          : { background: menu.accent, color: readableOn(menu.accent), fontFamily: "var(--font-menu-playfair)" }
      }
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function TagIcons({ tags, subtle }: { tags: MenuTag[]; subtle?: boolean }) {
  // Sur la carte gastronomique, « coup de cœur » n'est pas signalé par un pictogramme.
  const shown = subtle ? tags.filter((t) => t !== "popular") : tags
  if (!shown.length) return null
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {shown.map((tag) => {
        const Icon = TAG_ICONS[tag]
        return (
          <span
            key={tag}
            title={TAG_LABELS[tag]}
            className={cn("grid place-items-center rounded-full", subtle ? "size-4" : "size-5")}
            style={subtle ? { color: "var(--m-muted)" } : { background: `color-mix(in oklab, ${TAG_COLORS[tag]} 14%, transparent)`, color: TAG_COLORS[tag] }}
          >
            <Icon className={subtle ? "size-3.5" : "size-3"} />
            <span className="sr-only">{TAG_LABELS[tag]}</span>
          </span>
        )
      })}
    </span>
  )
}

export function SoldOut() {
  return (
    <span className="rounded-full bg-[var(--m-border)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--m-muted)] uppercase">
      Épuisé
    </span>
  )
}

export function EmptySearch(ctx: Pick<LayoutCtx, "menu" | "search">) {
  return (
    <div className="py-16 text-center">
      <Search className="mx-auto size-8 text-[var(--m-muted)]" />
      <p className="mt-3 font-medium">Aucun plat ne correspond</p>
      <button
        type="button"
        onClick={() => {
          ctx.search.setQuery("")
          ctx.search.setDiets([])
        }}
        className="mt-2 text-sm font-medium underline underline-offset-4"
        style={{ color: ctx.menu.accent }}
      >
        Réinitialiser
      </button>
    </div>
  )
}

export function Footer(ctx: Pick<LayoutCtx, "menu" | "usedTags"> & { carte?: boolean }) {
  const { menu, usedTags, carte } = ctx
  const legend = usedTags.filter((t) => t !== "popular")
  return (
    <footer className={cn("mt-14 space-y-4 text-center", carte ? "px-8" : "px-6")}>
      {legend.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-[var(--m-muted)]">
          {legend.map((tag) => {
            const Icon = TAG_ICONS[tag]
            return (
              <span key={tag} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5" style={{ color: carte ? "var(--m-muted)" : TAG_COLORS[tag] }} />
                {TAG_LABELS[tag]}
              </span>
            )
          })}
        </div>
      )}
      {menu.note && (
        <p
          className={cn("mx-auto max-w-sm text-[13px] leading-relaxed text-[var(--m-muted)]", carte && "italic")}
          style={carte ? { fontFamily: "var(--m-display)" } : undefined}
        >
          {menu.note}
        </p>
      )}
      {menu.restaurant.address && <p className="text-[12.5px] text-[var(--m-muted)]">{menu.restaurant.address}</p>}
      <Link href="/" className="inline-block pt-3 text-[11px] text-[var(--m-muted)] opacity-60 transition-opacity hover:opacity-100">
        Menu digital propulsé par QR Creator
      </Link>
    </footer>
  )
}

export function InfoRow({ icon: Icon, label, value, href }: { icon: typeof Clock; label: string; value: string; href?: string | null }) {
  const body = (
    <>
      <Icon className="mt-0.5 size-[18px] shrink-0 text-[var(--m-muted)]" />
      <span className="min-w-0">
        <span className="block text-xs text-[var(--m-muted)]">{label}</span>
        <span className="block text-[15px]">{value}</span>
      </span>
    </>
  )
  return (
    <li>
      {href ? (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex gap-3 py-3.5">
          {body}
        </a>
      ) : (
        <div className="flex gap-3 py-3.5">{body}</div>
      )}
    </li>
  )
}

export function CopyRow({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4 text-left"
    >
      <span>
        <span className="block text-xs text-[var(--m-muted)]">Mot de passe</span>
        <span className="font-mono text-[15px] break-all">{value}</span>
      </span>
      <span
        className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium"
        style={{ background: "var(--m-accent)", color: "var(--m-on-accent)" }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copié" : "Copier"}
      </span>
    </button>
  )
}

export function BottomSheet({
  open,
  onClose,
  embedded,
  flush,
  children,
}: {
  open: boolean
  onClose: () => void
  embedded: boolean
  /** Contenu bord à bord (photo en tête de fiche). */
  flush?: boolean
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    // En pleine page, on bloque le défilement de l'arrière-plan.
    const previous = document.body.style.overflow
    if (!embedded) document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose, embedded])

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("z-50", embedded ? "absolute inset-0" : "fixed inset-0")} role="dialog" aria-modal="true">
          <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn(
              "absolute inset-x-0 bottom-0 mx-auto max-h-[90%] max-w-xl overflow-y-auto rounded-t-[28px] bg-[var(--m-surface)] pb-8 shadow-2xl",
              !flush && "p-5 pt-3",
            )}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 340 }}
          >
            {!flush && <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--m-border)]" />}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "absolute top-3.5 right-3.5 z-10 grid size-9 place-items-center rounded-full",
                flush ? "bg-black/45 text-white backdrop-blur" : "bg-[var(--m-bg)]",
              )}
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


"use client"

import { Check, Clock, Copy, Globe, MapPin, Phone, Search, UtensilsCrossed, Wifi, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { DIET_TAGS, formatPrice, type MenuData, type MenuItem, type MenuTag } from "@/lib/qr/menu"
import { normalizeUrl } from "@/lib/qr/content"
import { cn } from "@/lib/utils"
import { fraunces, playfair } from "./fonts"
import { TAG_COLORS, TAG_ICONS, TAG_LABELS } from "./menu-tags"

type Palette = { bg: string; card: string; fg: string; muted: string; border: string; display: string }

const PALETTES: Record<MenuData["theme"], Palette> = {
  modern: { bg: "#fafaf9", card: "#ffffff", fg: "#1c1917", muted: "#78716c", border: "#e7e5e4", display: "var(--font-geist-sans)" },
  elegant: { bg: "#0c0a09", card: "#171412", fg: "#f5f5f4", muted: "#a8a29e", border: "#292524", display: "var(--font-menu-elegant)" },
  bistro: { bg: "#f6efe3", card: "#fffaf1", fg: "#2b2118", muted: "#7c6a58", border: "#e6d8c2", display: "var(--font-menu-bistro)" },
}

function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.6 ? "#1c1917" : "#ffffff"
}

const fold = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

type Props = {
  menu: MenuData
  /** Aperçu intégré (éditeur) : le menu défile dans son propre conteneur au lieu de la fenêtre. */
  embedded?: boolean
  className?: string
}

export function MenuView({ menu, embedded = false, className }: Props) {
  const reduce = useReducedMotion()
  const palette = PALETTES[menu.theme]
  const onAccent = readableOn(menu.accent)
  const { restaurant: r } = menu

  const scrollRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef(new Map<string, HTMLElement>())
  const [active, setActive] = useState(menu.sections[0]?.id ?? "")
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [diets, setDiets] = useState<MenuTag[]>([])
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [wifiOpen, setWifiOpen] = useState(false)

  const availableDiets = useMemo(
    () => DIET_TAGS.filter((t) => menu.sections.some((s) => s.items.some((i) => i.tags.includes(t)))),
    [menu.sections],
  )

  const sections = useMemo(() => {
    const q = fold(query.trim())
    return menu.sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            (!q || fold(`${i.name} ${i.description}`).includes(q)) && diets.every((d) => i.tags.includes(d)),
        ),
      }))
      .filter((s) => s.items.length > 0)
  }, [menu.sections, query, diets])

  // Catégorie active selon la position de défilement
  useEffect(() => {
    const root = embedded ? scrollRef.current : null
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.getAttribute("data-section") ?? "")
      },
      { root, rootMargin: "-130px 0px -55% 0px", threshold: 0 },
    )
    sectionRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections, embedded])

  // La pastille active reste visible dans la barre horizontale
  useEffect(() => {
    const pill = pillsRef.current?.querySelector<HTMLElement>(`[data-pill="${active}"]`)
    const bar = pillsRef.current
    if (pill && bar) bar.scrollTo({ left: pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2, behavior: reduce ? "auto" : "smooth" })
  }, [active, reduce])

  const goTo = (id: string) => {
    const el = sectionRefs.current.get(id)
    if (!el) return
    setActive(id)
    const behavior = reduce ? "auto" : "smooth"
    if (embedded && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 112, behavior })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 112, behavior })
  }

  const chips = [
    r.hours && { icon: Clock, label: r.hours, short: "Horaires" },
    r.phone && { icon: Phone, label: "Appeler", href: `tel:${r.phone.replace(/[^\d+]/g, "")}` },
    r.address && { icon: MapPin, label: "Itinéraire", href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}` },
    r.wifiSsid && { icon: Wifi, label: "Wi-Fi", onClick: () => setWifiOpen(true) },
    r.website && { icon: Globe, label: "Site web", href: normalizeUrl(r.website) },
  ].filter(Boolean) as { icon: typeof Clock; label: string; short?: string; href?: string; onClick?: () => void }[]

  const style = {
    "--m-bg": palette.bg,
    "--m-card": palette.card,
    "--m-fg": palette.fg,
    "--m-muted": palette.muted,
    "--m-border": palette.border,
    "--m-accent": menu.accent,
    "--m-on-accent": onAccent,
    "--m-display": palette.display,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        playfair.variable,
        fraunces.variable,
        "relative bg-[var(--m-bg)] text-[var(--m-fg)] antialiased",
        embedded ? "h-full overflow-hidden" : "min-h-svh",
        className,
      )}
      style={style}
    >
      <div ref={scrollRef} className={cn(embedded && "h-full overflow-y-auto overscroll-contain")}>
        <div className="mx-auto max-w-xl pb-10">
          {/* Couverture */}
          <header className="relative">
            {/* Le fondu est un masque sur la couverture : aucun raccord visible avec le fond, quel que soit le thème. */}
            <div className="relative h-56 overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)] sm:h-64">
              {r.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.cover} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(120% 90% at 0% 0%, color-mix(in oklab, ${menu.accent} 85%, white) 0%, ${menu.accent} 45%, color-mix(in oklab, ${menu.accent} 55%, black) 100%)`,
                  }}
                >
                  <UtensilsCrossed className="absolute top-1/2 right-6 size-40 -translate-y-1/2 rotate-12 opacity-10" style={{ color: onAccent }} />
                </div>
              )}
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/15 to-transparent" />
            </div>
            <div className="relative -mt-16 px-5">
              {r.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.logo}
                  alt={`Logo ${r.name}`}
                  className="size-20 rounded-2xl border-4 border-[var(--m-bg)] bg-[var(--m-card)] object-cover shadow-lg"
                />
              ) : (
                <div
                  className="grid size-20 place-items-center rounded-2xl border-4 border-[var(--m-bg)] text-2xl font-semibold shadow-lg"
                  style={{ background: menu.accent, color: onAccent, fontFamily: "var(--m-display)" }}
                >
                  {(r.name || "M").slice(0, 1).toUpperCase()}
                </div>
              )}
              <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-tight text-balance" style={{ fontFamily: "var(--m-display)" }}>
                {r.name || "Votre restaurant"}
              </h1>
              {r.tagline && <p className="mt-1.5 text-[15px] text-[var(--m-muted)]">{r.tagline}</p>}

              {chips.length > 0 && (
                <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
                  {chips.map((chip) => {
                    const inner = (
                      <>
                        <chip.icon className="size-4 shrink-0" style={{ color: menu.accent }} />
                        <span className="max-w-[16rem] truncate">{chip.label}</span>
                      </>
                    )
                    const cls =
                      "flex shrink-0 items-center gap-2 rounded-full border border-[var(--m-border)] bg-[var(--m-card)] px-3.5 py-2 text-[13px] font-medium shadow-sm transition-transform active:scale-95"
                    return chip.href ? (
                      <a key={chip.label} href={chip.href} target={chip.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
                        {inner}
                      </a>
                    ) : chip.onClick ? (
                      <button key={chip.label} type="button" onClick={chip.onClick} className={cls}>
                        {inner}
                      </button>
                    ) : (
                      <span key={chip.label} className={cls}>
                        {inner}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </header>

          {/* Barre de navigation collante */}
          <div className="sticky top-0 z-20 mt-6 border-b border-[var(--m-border)] bg-[color-mix(in_oklab,var(--m-bg)_88%,transparent)] backdrop-blur-xl">
            <div className="flex items-center gap-2 px-5 py-3">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--m-border)] bg-[var(--m-card)]"
                aria-label={searchOpen ? "Fermer la recherche" : "Rechercher un plat"}
              >
                {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
              </button>
              <div ref={pillsRef} className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
                {menu.sections.map((s) => {
                  const isActive = active === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      data-pill={s.id}
                      onClick={() => goTo(s.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors",
                        !isActive && "text-[var(--m-muted)] hover:text-[var(--m-fg)]",
                      )}
                      style={isActive ? { background: menu.accent, color: onAccent } : undefined}
                    >
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <AnimatePresence initial={false}>
              {searchOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2.5 px-5 pb-3">
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher un plat, un ingrédient…"
                      className="h-11 w-full rounded-xl border border-[var(--m-border)] bg-[var(--m-card)] px-4 text-[15px] outline-none placeholder:text-[var(--m-muted)] focus:border-[var(--m-accent)]"
                    />
                    {availableDiets.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {availableDiets.map((tag) => {
                          const on = diets.includes(tag)
                          const Icon = TAG_ICONS[tag]
                          return (
                            <button
                              key={tag}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setDiets((d) => (on ? d.filter((t) => t !== tag) : [...d, tag]))}
                              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors"
                              style={
                                on
                                  ? { background: TAG_COLORS[tag], borderColor: TAG_COLORS[tag], color: "#fff" }
                                  : { borderColor: "var(--m-border)", background: "var(--m-card)" }
                              }
                            >
                              {on ? <Check className="size-3.5" /> : <Icon className="size-3.5" style={{ color: TAG_COLORS[tag] }} />}
                              {TAG_LABELS[tag]}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Carte */}
          <main className="space-y-10 px-5 pt-6">
            {sections.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="mx-auto size-8 text-[var(--m-muted)]" />
                <p className="mt-3 font-medium">Aucun plat ne correspond</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setDiets([])
                  }}
                  className="mt-2 text-sm font-medium underline underline-offset-4"
                  style={{ color: menu.accent }}
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              sections.map((section) => (
                <section
                  key={section.id}
                  data-section={section.id}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(section.id, el)
                    else sectionRefs.current.delete(section.id)
                  }}
                >
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <h2 className="text-[22px] font-semibold tracking-tight" style={{ fontFamily: "var(--m-display)" }}>
                      {section.name}
                    </h2>
                    <span className="pb-1 text-xs text-[var(--m-muted)]">
                      {section.items.length} choix
                    </span>
                  </div>
                  {section.description && <p className="-mt-2 mb-4 text-sm text-[var(--m-muted)]">{section.description}</p>}
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className={cn(
                            "flex w-full gap-4 rounded-2xl border border-[var(--m-border)] bg-[var(--m-card)] p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform active:scale-[0.99]",
                            !item.available && "opacity-55",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] leading-snug font-semibold">{item.name}</p>
                            {item.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {item.tags.map((tag) => {
                                  const Icon = TAG_ICONS[tag]
                                  return (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-medium"
                                      style={{ background: `color-mix(in oklab, ${TAG_COLORS[tag]} 14%, transparent)`, color: TAG_COLORS[tag] }}
                                    >
                                      <Icon className="size-3" />
                                      {TAG_LABELS[tag]}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                            {item.description && <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--m-muted)]">{item.description}</p>}
                            <div className="mt-2.5 flex items-center gap-2">
                              {item.price !== null && (
                                <span className="text-[15px] font-semibold tabular-nums" style={{ color: menu.accent }}>
                                  {formatPrice(item.price, menu.currency)}
                                </span>
                              )}
                              {!item.available && (
                                <span className="rounded-full border border-[var(--m-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--m-muted)]">
                                  Épuisé
                                </span>
                              )}
                            </div>
                          </div>
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" loading="lazy" className="size-24 shrink-0 rounded-xl object-cover" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </main>

          <footer className="mt-12 space-y-3 px-5 text-center">
            {menu.note && <p className="text-[13px] leading-relaxed text-[var(--m-muted)]">{menu.note}</p>}
            {r.address && <p className="text-[13px] text-[var(--m-muted)]">{r.address}</p>}
            <Link href="/" className="inline-block pt-2 text-[11px] text-[var(--m-muted)] opacity-70 hover:opacity-100">
              Menu digital propulsé par QR Creator
            </Link>
          </footer>
        </div>
      </div>

      {/* Fiches (plat, Wi-Fi) : superposées au menu, y compris dans l'aperçu intégré */}
      <BottomSheet open={Boolean(selected)} onClose={() => setSelected(null)} embedded={embedded}>
        {selected && (
          <div>
            {selected.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            )}
            <div className={cn(selected.image && "mt-5")}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[22px] leading-tight font-semibold" style={{ fontFamily: "var(--m-display)" }}>
                  {selected.name}
                </h3>
                {selected.price !== null && (
                  <span className="pt-1 text-lg font-semibold tabular-nums" style={{ color: menu.accent }}>
                    {formatPrice(selected.price, menu.currency)}
                  </span>
                )}
              </div>
              {!selected.available && <p className="mt-2 text-sm font-medium text-[var(--m-muted)]">Momentanément épuisé</p>}
              {selected.description && <p className="mt-3 text-[15px] leading-relaxed text-[var(--m-muted)]">{selected.description}</p>}
              {selected.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.tags.map((tag) => {
                    const Icon = TAG_ICONS[tag]
                    return (
                      <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--m-border)] px-3 py-1.5 text-[13px]">
                        <Icon className="size-4" style={{ color: TAG_COLORS[tag] }} />
                        {TAG_LABELS[tag]}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={wifiOpen} onClose={() => setWifiOpen(false)} embedded={embedded}>
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl" style={{ background: menu.accent, color: onAccent }}>
            <Wifi className="size-7" />
          </span>
          <h3 className="mt-4 text-xl font-semibold" style={{ fontFamily: "var(--m-display)" }}>
            Wi-Fi offert
          </h3>
          <p className="mt-1 text-sm text-[var(--m-muted)]">Réseau « {r.wifiSsid} »</p>
          {r.wifiPassword && <CopyRow value={r.wifiPassword} accent={menu.accent} onAccent={onAccent} />}
        </div>
      </BottomSheet>
    </div>
  )
}

function CopyRow({ value, accent, onAccent }: { value: string; accent: string; onAccent: string }) {
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
      <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium" style={{ background: accent, color: onAccent }}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copié" : "Copier"}
      </span>
    </button>
  )
}

function BottomSheet({
  open,
  onClose,
  embedded,
  children,
}: {
  open: boolean
  onClose: () => void
  embedded: boolean
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
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[88%] max-w-xl overflow-y-auto rounded-t-3xl bg-[var(--m-card)] p-5 pb-8 shadow-2xl"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--m-border)]" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-[var(--m-bg)]"
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

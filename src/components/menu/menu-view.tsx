"use client"

import { Check, Clock, Globe, MapPin, Phone, Search, SlidersHorizontal, Wifi, X } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import { normalizeUrl } from "@/lib/qr/content"
import { DIET_TAGS, displayPrice, formatPrice, themeLayout, type MenuData, type MenuItem, type MenuTag } from "@/lib/qr/menu"
import { cn } from "@/lib/utils"
import { BottomSheet, CopyRow, Cover, EmptySearch, Footer, fold, InfoRow, Logo, Placeholder, readableOn, SoldOut, TagIcons, type LayoutCtx } from "./menu-parts"
import { DeliveryLayout } from "./delivery-layout"
import { fraunces, playfair } from "./fonts"
import { TAG_COLORS, TAG_ICONS, TAG_LABELS } from "./menu-tags"

/* ------------------------------------------------------------------ */
/* Thèmes                                                              */
/* ------------------------------------------------------------------ */

type Palette = { bg: string; surface: string; fg: string; muted: string; border: string; display: string; texture?: string }

const PAPER = "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.035) 1px, transparent 0) 0 0 / 5px 5px"

const PALETTES: Record<MenuData["theme"], Palette> = {
  delivery: { bg: "#f4f4f5", surface: "#ffffff", fg: "#111111", muted: "#6b7280", border: "#e5e7eb", display: "var(--font-geist-sans)" },
  modern: { bg: "#f7f7f5", surface: "#ffffff", fg: "#18181b", muted: "#71717a", border: "#e7e5e4", display: "var(--font-geist-sans)" },
  classic: { bg: "#fdfcfa", surface: "#ffffff", fg: "#1c1917", muted: "#78716c", border: "#e8e2d8", display: "var(--font-menu-playfair)", texture: PAPER },
  bistro: { bg: "#f4ecdf", surface: "#fbf6ee", fg: "#2b2118", muted: "#7a6650", border: "#e0d1b9", display: "var(--font-menu-fraunces)", texture: PAPER },
  elegant: { bg: "#0e0c0b", surface: "#181513", fg: "#f5f1ea", muted: "#a39b90", border: "#2c2724", display: "var(--font-menu-playfair)" },
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

type Props = {
  menu: MenuData
  /** Aperçu intégré (éditeur, démo) : le menu défile dans son propre conteneur au lieu de la fenêtre. */
  embedded?: boolean
  /** Code court du QR : requis pour envoyer de vraies commandes (absent dans les aperçus). */
  shortCode?: string
  className?: string
}

export function MenuView({ menu, embedded = false, shortCode, className }: Props) {
  const reduce = useReducedMotion()
  const uid = useId()
  const layout = themeLayout(menu.theme)
  const palette = PALETTES[menu.theme]
  const onAccent = readableOn(menu.accent)
  const r = menu.restaurant

  const scrollRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef(new Map<string, HTMLElement>())
  const [active, setActive] = useState(menu.sections[0]?.id ?? "")
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [diets, setDiets] = useState<MenuTag[]>([])
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [sheet, setSheet] = useState<"wifi" | "info" | null>(null)

  const availableDiets = useMemo(
    () => DIET_TAGS.filter((t) => menu.sections.some((s) => s.items.some((i) => i.tags.includes(t)))),
    [menu.sections],
  )
  const usedTags = useMemo(() => [...new Set(menu.sections.flatMap((s) => s.items.flatMap((i) => i.tags)))], [menu.sections])
  const filtering = query.trim() !== "" || diets.length > 0

  const sections = useMemo(() => {
    const q = fold(query.trim())
    return menu.sections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => (!q || fold(`${i.name} ${i.description}`).includes(q)) && diets.every((d) => i.tags.includes(d))),
      }))
      .filter((s) => s.items.length > 0)
  }, [menu.sections, query, diets])

  const featured = useMemo(
    () => menu.sections.flatMap((s) => s.items).filter((i) => i.tags.includes("popular") && i.available).slice(0, 8),
    [menu.sections],
  )

  // Catégorie active selon la position de défilement
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.getAttribute("data-section") ?? "")
      },
      { root: embedded ? scrollRef.current : null, rootMargin: "-140px 0px -55% 0px" },
    )
    sectionRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections, embedded])

  // L'onglet actif reste visible dans la barre horizontale
  useEffect(() => {
    const bar = tabsRef.current
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
    if (bar && tab) bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: reduce ? "auto" : "smooth" })
  }, [active, reduce])

  const goTo = (id: string) => {
    const el = sectionRefs.current.get(id)
    if (!el) return
    setActive(id)
    const offset = (navRef.current?.offsetHeight ?? 56) + 12
    const behavior = reduce ? "auto" : "smooth"
    if (embedded && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - offset, behavior })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior })
  }

  const registerSection = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el)
    else sectionRefs.current.delete(id)
  }

  const links = {
    phone: r.phone ? `tel:${r.phone.replace(/[^\d+]/g, "")}` : null,
    map: r.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}` : null,
    website: r.website ? normalizeUrl(r.website) : null,
  }

  const style = {
    "--m-bg": palette.bg,
    "--m-surface": palette.surface,
    "--m-fg": palette.fg,
    "--m-muted": palette.muted,
    "--m-border": palette.border,
    "--m-accent": menu.accent,
    "--m-on-accent": onAccent,
    "--m-display": palette.display,
    background: palette.texture ? `${palette.texture}, ${palette.bg}` : palette.bg,
  } as React.CSSProperties

  const ctx: LayoutCtx = {
    menu,
    sections,
    featured: filtering ? [] : featured,
    usedTags,
    active,
    links,
    goTo,
    registerSection,
    onSelect: setSelected,
    openSheet: setSheet,
    setNavEl: (el) => {
      navRef.current = el
    },
    setTabsEl: (el) => {
      tabsRef.current = el
    },
    uid,
    search: { open: searchOpen, setOpen: setSearchOpen, query, setQuery, diets, setDiets, availableDiets, filtering },
  }

  return (
    <div
      className={cn(
        playfair.variable,
        fraunces.variable,
        "relative text-[var(--m-fg)] antialiased",
        embedded ? "h-full overflow-hidden" : "min-h-svh",
        className,
      )}
      style={style}
    >
      <div ref={scrollRef} className={cn(embedded && "h-full overflow-y-auto overscroll-contain [scrollbar-width:none]")}>
        {layout === "delivery" ? (
          <DeliveryLayout {...ctx} embedded={embedded} shortCode={shortCode} />
        ) : layout === "app" ? (
          <AppLayout {...ctx} />
        ) : (
          <CarteLayout {...ctx} />
        )}
      </div>

      <BottomSheet open={layout !== "delivery" && Boolean(selected)} onClose={() => setSelected(null)} embedded={embedded} flush={Boolean(selected?.image)}>
        {selected && <ItemDetail item={selected} menu={menu} carte={layout === "carte"} />}
      </BottomSheet>

      <BottomSheet open={sheet === "wifi"} onClose={() => setSheet(null)} embedded={embedded}>
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl" style={{ background: menu.accent, color: onAccent }}>
            <Wifi className="size-7" />
          </span>
          <h3 className="mt-4 text-xl font-semibold" style={{ fontFamily: "var(--m-display)" }}>
            Wi-Fi offert
          </h3>
          <p className="mt-1 text-sm text-[var(--m-muted)]">Réseau « {r.wifiSsid} »</p>
          {r.wifiPassword && <CopyRow value={r.wifiPassword} />}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "info"} onClose={() => setSheet(null)} embedded={embedded}>
        <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--m-display)" }}>
          {r.name}
        </h3>
        <ul className="mt-4 divide-y divide-[var(--m-border)]">
          {r.hours && <InfoRow icon={Clock} label="Horaires" value={r.hours} />}
          {r.address && <InfoRow icon={MapPin} label="Adresse" value={r.address} href={links.map} />}
          {r.phone && <InfoRow icon={Phone} label="Téléphone" value={r.phone} href={links.phone} />}
          {links.website && <InfoRow icon={Globe} label="Site web" value={r.website.replace(/^https?:\/\//, "")} href={links.website} />}
        </ul>
      </BottomSheet>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mise en page « app » : photos en vedette                            */
/* ------------------------------------------------------------------ */

function AppLayout(ctx: LayoutCtx) {
  const { menu, links } = ctx
  const r = menu.restaurant
  const chips = [
    (r.hours || r.address) && { icon: Clock, label: "Horaires & infos", onClick: () => ctx.openSheet("info") },
    links.phone && { icon: Phone, label: "Appeler", href: links.phone },
    links.map && { icon: MapPin, label: "Itinéraire", href: links.map },
    r.wifiSsid && { icon: Wifi, label: "Wi-Fi", onClick: () => ctx.openSheet("wifi") },
  ].filter(Boolean) as { icon: typeof Clock; label: string; href?: string; onClick?: () => void }[]

  return (
    <div className="mx-auto max-w-xl pb-12">
      <header className="relative h-[300px] overflow-hidden text-white">
        <Cover menu={menu} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 pb-9">
          <div className="flex items-end gap-3.5">
            <Logo menu={menu} className="size-14 rounded-2xl ring-2 ring-white/90" />
            <div className="min-w-0 pb-0.5">
              {r.cuisine && <p className="truncate text-[11px] font-medium tracking-[0.14em] text-white/75 uppercase">{r.cuisine}</p>}
              <h1 className="text-[27px] leading-[1.1] font-bold tracking-tight text-balance">{r.name || "Votre restaurant"}</h1>
            </div>
          </div>
          {r.tagline && <p className="mt-2.5 text-[14px] leading-snug text-white/85">{r.tagline}</p>}
        </div>
      </header>

      <div className="relative -mt-5 rounded-t-[26px] bg-[var(--m-bg)] pt-4">
        {chips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
            {chips.map((chip) => {
              const cls =
                "flex shrink-0 items-center gap-2 rounded-full border border-[var(--m-border)] bg-[var(--m-surface)] px-3.5 py-2 text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform active:scale-95"
              const inner = (
                <>
                  <chip.icon className="size-4" style={{ color: menu.accent }} />
                  {chip.label}
                </>
              )
              return chip.href ? (
                <a key={chip.label} href={chip.href} target={chip.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <button key={chip.label} type="button" onClick={chip.onClick} className={cls}>
                  {inner}
                </button>
              )
            })}
          </div>
        )}

        <StickyNav {...ctx} variant="app" />

        {ctx.featured.length > 0 && (
          <section className="pt-6">
            <h2 className="px-5 text-[19px] font-bold tracking-tight">Les coups de cœur</h2>
            <div className="mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
              {ctx.featured.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => ctx.onSelect(item)}
                  className="w-[210px] shrink-0 snap-start text-left transition-transform active:scale-[0.98]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--m-border)]">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <Placeholder accent={menu.accent} />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-[14.5px] font-semibold">{item.name}</p>
                  <p className="text-[14px] font-semibold tabular-nums" style={{ color: menu.accent }}>
                    {displayPrice(item, menu.currency)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        <main className="space-y-8 px-5 pt-6">
          {ctx.sections.length === 0 ? (
            <EmptySearch {...ctx} />
          ) : (
            ctx.sections.map((section) => (
              <section key={section.id} data-section={section.id} ref={ctx.registerSection(section.id)}>
                <h2 className="text-[19px] font-bold tracking-tight">{section.name}</h2>
                {section.description && <p className="mt-0.5 text-[13px] text-[var(--m-muted)]">{section.description}</p>}
                <ul className="mt-2 divide-y divide-[var(--m-border)]">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => ctx.onSelect(item)}
                        className="flex w-full gap-4 py-4 text-left transition-opacity active:opacity-70"
                      >
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-[15.5px] leading-snug font-semibold", !item.available && "text-[var(--m-muted)]")}>{item.name}</p>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--m-muted)]">{item.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="text-[15px] font-semibold tabular-nums">{displayPrice(item, menu.currency)}</span>
                            <TagIcons tags={item.tags} />
                            {!item.available && <SoldOut />}
                          </div>
                        </div>
                        {item.image && (
                          <div className="relative size-[100px] shrink-0 overflow-hidden rounded-2xl bg-[var(--m-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt="" loading="lazy" className={cn("size-full object-cover", !item.available && "opacity-60 grayscale")} />
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </main>

        <Footer {...ctx} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mise en page « carte » : carte gastronomique imprimée               */
/* ------------------------------------------------------------------ */

function CarteLayout(ctx: LayoutCtx) {
  const { menu, links } = ctx
  const r = menu.restaurant
  const actions = [
    links.phone && { label: "Appeler", href: links.phone },
    links.map && { label: "Itinéraire", href: links.map },
    r.wifiSsid && { label: "Wi-Fi", onClick: () => ctx.openSheet("wifi") },
    (r.hours || r.address) && { label: "Infos", onClick: () => ctx.openSheet("info") },
  ].filter(Boolean) as { label: string; href?: string; onClick?: () => void }[]

  return (
    <div className="mx-auto max-w-lg pb-14">
      <header className="px-7 pt-10 text-center">
        {r.cover && (
          <div className="mx-auto mb-8 aspect-[4/5] w-[62%] max-w-[240px] rounded-t-full border border-[var(--m-border)] p-1.5">
            <div className="relative size-full overflow-hidden rounded-t-full">
              <Cover menu={menu} />
            </div>
          </div>
        )}
        {!r.cover && <Logo menu={menu} className="mx-auto mb-6 size-16 rounded-full" carte />}
        {r.cuisine && <p className="text-[10.5px] font-medium tracking-[0.32em] text-[var(--m-muted)] uppercase">{r.cuisine}</p>}
        <h1 className="mt-3 text-[34px] leading-[1.08] font-medium tracking-tight text-balance" style={{ fontFamily: "var(--m-display)" }}>
          {r.name || "Votre restaurant"}
        </h1>
        {r.tagline && (
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-[var(--m-muted)] italic" style={{ fontFamily: "var(--m-display)" }}>
            {r.tagline}
          </p>
        )}
        <Ornament accent={menu.accent} />
        {r.hours && <p className="text-[12.5px] text-[var(--m-muted)]">{r.hours}</p>}
        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {actions.map((a) => {
              const cls = "border-b border-transparent pb-0.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors hover:border-current"
              const content = <span style={{ color: menu.accent }}>{a.label}</span>
              return a.href ? (
                <a key={a.label} href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
                  {content}
                </a>
              ) : (
                <button key={a.label} type="button" onClick={a.onClick} className={cls}>
                  {content}
                </button>
              )
            })}
          </div>
        )}
      </header>

      <div className="mt-8">
        <StickyNav {...ctx} variant="carte" />
      </div>

      <main className="space-y-12 px-7 pt-10">
        {ctx.sections.length === 0 ? (
          <EmptySearch {...ctx} />
        ) : (
          ctx.sections.map((section) => (
            <section key={section.id} data-section={section.id} ref={ctx.registerSection(section.id)}>
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-[var(--m-border)]" />
                <h2 className="text-[13px] font-semibold tracking-[0.28em] uppercase" style={{ fontFamily: "var(--m-display)" }}>
                  {section.name}
                </h2>
                <span className="h-px flex-1 bg-[var(--m-border)]" />
              </div>
              {section.description && (
                <p className="mt-2 text-center text-[13.5px] text-[var(--m-muted)] italic" style={{ fontFamily: "var(--m-display)" }}>
                  {section.description}
                </p>
              )}
              <ul className="mt-6 space-y-6">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => ctx.onSelect(item)} className="flex w-full gap-4 text-left transition-opacity active:opacity-70">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className={cn(
                            "mt-0.5 size-14 shrink-0 rounded-full object-cover ring-1 ring-[var(--m-border)] ring-offset-2 ring-offset-[var(--m-bg)]",
                            !item.available && "opacity-50 grayscale",
                          )}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn("text-[17px] leading-snug font-medium", !item.available && "text-[var(--m-muted)] line-through decoration-1")}
                            style={{ fontFamily: "var(--m-display)" }}
                          >
                            {item.name}
                          </span>
                          <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-[color-mix(in_oklab,var(--m-muted)_55%,transparent)]" />
                          {item.price !== null && (
                            <span className="text-[16px] tabular-nums" style={{ fontFamily: "var(--m-display)" }}>
                              {formatPrice(item.price, menu.currency)}
                            </span>
                          )}
                        </div>
                        {(item.description || item.tags.some((t) => t !== "popular")) && (
                          <p className="mt-1 text-[14px] leading-relaxed text-[var(--m-muted)] italic" style={{ fontFamily: "var(--m-display)" }}>
                            {item.description}
                            {item.tags.some((t) => t !== "popular") && (
                              <span className="ml-1.5 inline-flex translate-y-[2px] not-italic">
                                <TagIcons tags={item.tags} subtle />
                              </span>
                            )}
                          </p>
                        )}
                        {item.variants.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
                            {item.variants.map((v) => (
                              <span key={v.id}>
                                <span className="text-[var(--m-muted)]">{v.label}</span>{" "}
                                <span className="tabular-nums" style={{ fontFamily: "var(--m-display)" }}>
                                  {formatPrice(v.price, menu.currency)}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                        {!item.available && (
                          <p className="mt-1 text-[10.5px] font-semibold tracking-[0.2em] text-[var(--m-muted)] uppercase">Épuisé</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      <Footer {...ctx} carte />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Éléments partagés                                                   */
/* ------------------------------------------------------------------ */

function StickyNav({ menu, search, variant, active, goTo, uid, setNavEl, setTabsEl }: LayoutCtx & { variant: "app" | "carte" }) {
  const reduce = useReducedMotion()
  const carte = variant === "carte"
  return (
    <div
      ref={setNavEl}
      className={cn(
        "sticky top-0 z-20 border-b border-[var(--m-border)] bg-[color-mix(in_oklab,var(--m-bg)_90%,transparent)] backdrop-blur-xl",
        !carte && "mt-4",
      )}
    >
      <div className="flex items-center gap-1 pr-3 pl-1">
        <LayoutGroup id={uid}>
          <div ref={setTabsEl} className="flex flex-1 gap-5 overflow-x-auto px-4 [scrollbar-width:none]">
            {menu.sections.map((s) => {
              const on = active === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  data-tab={s.id}
                  onClick={() => goTo(s.id)}
                  className={cn(
                    "relative shrink-0 py-3.5 whitespace-nowrap transition-colors",
                    carte ? "text-[11px] font-semibold tracking-[0.2em] uppercase" : "text-[14px] font-semibold",
                    !on && "text-[var(--m-muted)]",
                  )}
                >
                  {s.name}
                  {on && (
                    <motion.span
                      layoutId="tab-underline"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute inset-x-0 bottom-0 h-[2px] rounded-full"
                      style={{ background: menu.accent }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </LayoutGroup>
        <button
          type="button"
          onClick={() => search.setOpen((v) => !v)}
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-full transition-colors",
            search.open ? "bg-[var(--m-fg)] text-[var(--m-bg)]" : "hover:bg-[var(--m-border)]",
          )}
          aria-label={search.open ? "Fermer la recherche" : "Rechercher un plat"}
        >
          {search.open ? <X className="size-4" /> : <Search className="size-[18px]" />}
          {!search.open && search.filtering && <span className="absolute top-1.5 right-1.5 size-2 rounded-full" style={{ background: menu.accent }} />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {search.open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-5 pb-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--m-muted)]" />
                <input
                  autoFocus
                  value={search.query}
                  onChange={(e) => search.setQuery(e.target.value)}
                  placeholder="Un plat, un ingrédient…"
                  className="h-11 w-full rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] pr-4 pl-10 text-[15px] outline-none placeholder:text-[var(--m-muted)] focus:border-[var(--m-accent)]"
                />
              </div>
              {search.availableDiets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <SlidersHorizontal className="mr-1 size-3.5 text-[var(--m-muted)]" />
                  {search.availableDiets.map((tag) => {
                    const on = search.diets.includes(tag)
                    const Icon = TAG_ICONS[tag]
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={on}
                        onClick={() => search.setDiets((d) => (on ? d.filter((t) => t !== tag) : [...d, tag]))}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors"
                        style={
                          on
                            ? { background: menu.accent, borderColor: menu.accent, color: readableOn(menu.accent) }
                            : { borderColor: "var(--m-border)", background: "var(--m-surface)" }
                        }
                      >
                        {on ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
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
  )
}

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="my-6 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
      <svg viewBox="0 0 24 24" className="size-3.5" style={{ color: accent }}>
        <path fill="currentColor" d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
      </svg>
      <span className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
    </div>
  )
}

function ItemDetail({ item, menu, carte }: { item: MenuItem; menu: MenuData; carte: boolean }) {
  const display = carte ? { fontFamily: "var(--m-display)" } : undefined
  return (
    <div>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" />
      )}
      <div className={cn(item.image && "px-5 pt-5")}>
        <div className="flex items-start justify-between gap-4 pr-10">
          <h3 className={cn("text-[22px] leading-tight", carte ? "font-medium" : "font-bold tracking-tight")} style={display}>
            {item.name}
          </h3>
          {item.price !== null && (
            <span className="pt-1 text-lg font-semibold tabular-nums" style={{ color: menu.accent, ...display }}>
              {formatPrice(item.price, menu.currency)}
            </span>
          )}
        </div>
        {!item.available && <p className="mt-2 text-sm font-medium text-[var(--m-muted)]">Momentanément épuisé</p>}
        {item.description && (
          <p className={cn("mt-2.5 text-[15px] leading-relaxed text-[var(--m-muted)]", carte && "italic")} style={display}>
            {item.description}
          </p>
        )}
        {item.variants.length > 0 && (
          <ul className="mt-4 divide-y divide-[var(--m-border)] rounded-2xl border border-[var(--m-border)]">
            {item.variants.map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-3 text-[15px]">
                <span>{v.label}</span>
                <span className="font-semibold tabular-nums">{formatPrice(v.price, menu.currency)}</span>
              </li>
            ))}
          </ul>
        )}
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => {
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
  )
}


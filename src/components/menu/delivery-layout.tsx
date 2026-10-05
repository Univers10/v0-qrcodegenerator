"use client"

import {
  ArrowLeft,
  Bike,
  Check,
  CircleCheck,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  Utensils,
  Wifi,
  X,
} from "lucide-react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { useState } from "react"

import { MODE_LABELS } from "@/lib/orders"
import {
  displayPrice,
  enabledModes,
  formatPrice,
  isOrderable,
  unitPrice,
  type MenuData,
  type MenuItem,
  type OrderMode,
} from "@/lib/qr/menu"
import { cn } from "@/lib/utils"
import { useCart, type CartLine } from "./cart-store"
import { BottomSheet, EmptySearch, Footer, Logo, Placeholder, readableOn, TagIcons, type LayoutCtx } from "./menu-parts"

type Props = LayoutCtx & { embedded: boolean; shortCode?: string }

const MODE_ICONS: Record<OrderMode, typeof Bike> = { delivery: Bike, pickup: ShoppingBag, dine_in: Utensils }

export function DeliveryLayout({ setNavEl, setTabsEl, ...ctx }: Props) {
  const { menu, embedded, shortCode } = ctx
  const r = menu.restaurant
  const ordering = menu.ordering
  const canOrder = ordering.enabled
  const modes = enabledModes(ordering)
  const accent = menu.accent
  const onAccent = readableOn(accent)
  const reduce = useReducedMotion()

  const [mode, setMode] = useState<OrderMode>(modes[0] ?? "pickup")
  const [product, setProduct] = useState<MenuItem | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const cart = useCart(shortCode ?? "apercu", Boolean(shortCode) && !embedded)

  // Calculs légers (quelques dizaines de produits) : pas besoin de mémoïsation manuelle.
  const itemsById = new Map(menu.sections.flatMap((s) => s.items.map((i) => [i.id, i] as const)))
  // Lignes du panier encore valides (un produit peut avoir été retiré de la carte entre-temps)
  const resolved = cart.lines.flatMap((line) => {
    const item = itemsById.get(line.itemId)
    if (!item || !isOrderable(item)) return []
    const unit = unitPrice(item, line.variantId, line.choiceIds)
    if (unit === null) return []
    return [{ line, item, unit, total: unit * line.quantity }]
  })
  const count = resolved.reduce((n, l) => n + l.line.quantity, 0)
  const subtotal = resolved.reduce((n, l) => n + l.total, 0)
  const quantityOf = (itemId: string) => resolved.filter((l) => l.item.id === itemId).reduce((n, l) => n + l.line.quantity, 0)

  const quickAdd = (item: MenuItem) => {
    // Sans déclinaison ni option obligatoire : ajout direct, sinon on ouvre la fiche.
    if (item.variants.length === 0 && !item.options.some((g) => g.required)) {
      cart.add(item.id, null, [], 1)
    } else setProduct(item)
  }

  const info = [
    ordering.prepTime && { icon: Clock, label: ordering.prepTime },
    canOrder && mode === "delivery" && ordering.deliveryFee !== null && {
      icon: Bike,
      label: ordering.deliveryFee === 0 ? "Livraison offerte" : `Livraison ${formatPrice(ordering.deliveryFee, menu.currency)}`,
    },
    canOrder && ordering.minOrder !== null && { icon: ShoppingBag, label: `Min. ${formatPrice(ordering.minOrder, menu.currency)}` },
  ].filter(Boolean) as { icon: typeof Clock; label: string }[]

  return (
    <div className={cn("mx-auto max-w-xl", count > 0 ? "pb-28" : "pb-12")}>
      {/* En-tête */}
      <header className="relative">
        <div className="relative h-52 overflow-hidden bg-[var(--m-border)]">
          {r.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.cover} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <Placeholder accent={accent} large />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
        </div>
        <div className="relative z-10 -mt-12 px-4">
          <div className="rounded-3xl bg-[var(--m-surface)] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <Logo menu={menu} className="size-14 rounded-2xl ring-1 ring-black/5" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[21px] leading-tight font-extrabold tracking-tight">{r.name || "Votre restaurant"}</h1>
                {(r.cuisine || r.tagline) && <p className="truncate text-[13px] text-[var(--m-muted)]">{r.cuisine || r.tagline}</p>}
              </div>
              <div className="flex gap-1.5">
                {ctx.links.phone && (
                  <a href={ctx.links.phone} className="grid size-9 place-items-center rounded-full bg-[var(--m-bg)]" aria-label="Appeler">
                    <Phone className="size-4" />
                  </a>
                )}
                {(r.address || r.hours) && (
                  <button type="button" onClick={() => ctx.openSheet("info")} className="grid size-9 place-items-center rounded-full bg-[var(--m-bg)]" aria-label="Infos pratiques">
                    <MapPin className="size-4" />
                  </button>
                )}
                {r.wifiSsid && (
                  <button type="button" onClick={() => ctx.openSheet("wifi")} className="grid size-9 place-items-center rounded-full bg-[var(--m-bg)]" aria-label="Wi-Fi">
                    <Wifi className="size-4" />
                  </button>
                )}
              </div>
            </div>
            {info.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--m-border)] pt-3 text-[12.5px] font-medium text-[var(--m-muted)]">
                {info.map((i) => (
                  <span key={i.label} className="inline-flex items-center gap-1.5">
                    <i.icon className="size-3.5" />
                    {i.label}
                  </span>
                ))}
              </div>
            )}
            {canOrder && modes.length > 1 && (
              <div className="mt-3 grid rounded-full bg-[var(--m-bg)] p-1" style={{ gridTemplateColumns: `repeat(${modes.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label="Mode de commande">
                {modes.map((m) => {
                  const Icon = MODE_ICONS[m]
                  const on = mode === m
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setMode(m)}
                      className={cn("flex items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-semibold transition-colors", !on && "text-[var(--m-muted)]")}
                      style={on ? { background: "var(--m-surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" } : undefined}
                    >
                      <Icon className="size-4" style={on ? { color: accent } : undefined} />
                      {MODE_LABELS[m]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Barre de catégories collante */}
      <div ref={setNavEl} className="sticky top-0 z-20 mt-4 bg-[color-mix(in_oklab,var(--m-bg)_92%,transparent)] py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => ctx.search.setOpen((v) => !v)}
            className={cn("grid size-9 shrink-0 place-items-center rounded-full transition-colors", ctx.search.open ? "bg-[var(--m-fg)] text-[var(--m-bg)]" : "bg-[var(--m-surface)] shadow-sm ring-1 ring-black/5")}
            aria-label={ctx.search.open ? "Fermer la recherche" : "Rechercher"}
          >
            {ctx.search.open ? <X className="size-4" /> : <Search className="size-4" />}
          </button>
          <LayoutGroup id={`${ctx.uid}-pills`}>
            <div ref={setTabsEl} className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {menu.sections.map((s) => {
                const on = ctx.active === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-tab={s.id}
                    onClick={() => ctx.goTo(s.id)}
                    className={cn("relative shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors", !on && "bg-[var(--m-surface)] text-[var(--m-fg)] ring-1 ring-black/5")}
                  >
                    {on && (
                      <motion.span
                        layoutId="pill"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                        className="absolute inset-0 rounded-full"
                        style={{ background: "var(--m-fg)" }}
                      />
                    )}
                    <span className={cn("relative", on && "text-[var(--m-bg)]")}>{s.name}</span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>
        </div>
        <AnimatePresence initial={false}>
          {ctx.search.open && (
            <motion.div initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="relative mx-4 mt-2.5">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--m-muted)]" />
                <input
                  autoFocus
                  value={ctx.search.query}
                  onChange={(e) => ctx.search.setQuery(e.target.value)}
                  placeholder="Burger, tacos, boisson…"
                  className="h-11 w-full rounded-full bg-[var(--m-surface)] pr-4 pl-11 text-[15px] shadow-sm ring-1 ring-black/5 outline-none placeholder:text-[var(--m-muted)] focus:ring-2 focus:ring-[var(--m-accent)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Les plus commandés */}
      {ctx.featured.length > 0 && (
        <section className="pt-4">
          <h2 className="px-4 text-[19px] font-extrabold tracking-tight">Les plus commandés</h2>
          <div className="mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {ctx.featured.map((item) => (
              <ProductCard key={item.id} item={item} menu={menu} canOrder={canOrder} quantity={quantityOf(item.id)} onOpen={() => setProduct(item)} onAdd={() => quickAdd(item)} className="w-[44%] max-w-[180px] shrink-0 snap-start" />
            ))}
          </div>
        </section>
      )}

      <main className="space-y-8 px-4 pt-6">
        {ctx.sections.length === 0 ? (
          <EmptySearch {...ctx} />
        ) : (
          ctx.sections.map((section) => (
            <section key={section.id} data-section={section.id} ref={ctx.registerSection(section.id)}>
              <div className="mb-3">
                <h2 className="text-[19px] font-extrabold tracking-tight">{section.name}</h2>
                {section.description && <p className="text-[13px] text-[var(--m-muted)]">{section.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                {section.items.map((item) => (
                  <ProductCard key={item.id} item={item} menu={menu} canOrder={canOrder} quantity={quantityOf(item.id)} onOpen={() => setProduct(item)} onAdd={() => quickAdd(item)} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <Footer {...ctx} />

      {/* Barre panier flottante */}
      <AnimatePresence>
        {canOrder && count > 0 && !cartOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
            className={cn("inset-x-0 bottom-0 z-30 mx-auto max-w-xl p-4", embedded ? "absolute" : "fixed")}
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex h-14 w-full items-center gap-3 rounded-2xl px-4 text-[15px] font-bold shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.98]"
              style={{ background: accent, color: onAccent }}
            >
              <span className="grid size-7 place-items-center rounded-lg bg-black/15 text-[13px] tabular-nums">{count}</span>
              <span className="flex-1 text-left">Voir le panier</span>
              <span className="tabular-nums">{formatPrice(subtotal, menu.currency)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomSheet open={Boolean(product)} onClose={() => setProduct(null)} embedded={embedded} flush={Boolean(product?.image)}>
        {product && (
          <ProductSheet
            key={product.id}
            item={product}
            menu={menu}
            canOrder={canOrder}
            onAdd={(variantId, choiceIds, quantity) => {
              cart.add(product.id, variantId, choiceIds, quantity)
              setProduct(null)
            }}
          />
        )}
      </BottomSheet>

      <BottomSheet open={cartOpen} onClose={() => setCartOpen(false)} embedded={embedded}>
        <Checkout
          menu={menu}
          mode={mode}
          setMode={setMode}
          modes={modes}
          lines={resolved}
          subtotal={subtotal}
          onQuantity={cart.setQuantity}
          onClear={cart.clear}
          onClose={() => setCartOpen(false)}
          shortCode={embedded ? undefined : shortCode}
        />
      </BottomSheet>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function ProductCard({
  item,
  menu,
  canOrder,
  quantity,
  onOpen,
  onAdd,
  className,
}: {
  item: MenuItem
  menu: MenuData
  canOrder: boolean
  quantity: number
  onOpen: () => void
  onAdd: () => void
  className?: string
}) {
  const orderable = isOrderable(item)
  return (
    <div className={cn("group", className)}>
      <div className="relative">
        <button type="button" onClick={onOpen} className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-[var(--m-border)]" aria-label={item.name}>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className={cn("size-full object-cover transition-transform duration-500 group-hover:scale-105", !item.available && "opacity-50 grayscale")}
            />
          ) : (
            <Placeholder accent={menu.accent} />
          )}
          {item.tags.includes("popular") && item.available && (
            <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-bold text-zinc-900 shadow-sm">Populaire</span>
          )}
          {!item.available && (
            <span className="absolute inset-x-2 bottom-2 rounded-full bg-black/70 py-1 text-center text-[11px] font-semibold text-white backdrop-blur">Épuisé</span>
          )}
        </button>
        {canOrder && orderable && (
          <button
            type="button"
            onClick={onAdd}
            className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full shadow-lg ring-2 ring-white transition-transform active:scale-90"
            style={{ background: quantity > 0 ? menu.accent : "#fff", color: quantity > 0 ? readableOn(menu.accent) : "#111" }}
            aria-label={`Ajouter ${item.name}`}
          >
            {quantity > 0 ? <span className="text-[13px] font-bold tabular-nums">{quantity}</span> : <Plus className="size-5" strokeWidth={2.5} />}
          </button>
        )}
      </div>
      <button type="button" onClick={onOpen} className="mt-2 block w-full text-left">
        <p className="line-clamp-2 text-[14px] leading-snug font-semibold">{item.name}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[14px] font-bold tabular-nums">{displayPrice(item, menu.currency)}</span>
          <TagIcons tags={item.tags.filter((t) => t !== "popular")} />
        </div>
      </button>
    </div>
  )
}

function ProductSheet({
  item,
  menu,
  canOrder,
  onAdd,
}: {
  item: MenuItem
  menu: MenuData
  canOrder: boolean
  onAdd: (variantId: string | null, choiceIds: string[], quantity: number) => void
}) {
  const [variantId, setVariantId] = useState<string | null>(item.variants[0]?.id ?? null)
  const [choices, setChoices] = useState<Record<string, string[]>>({})
  const [quantity, setQuantity] = useState(1)
  const choiceIds = Object.values(choices).flat()
  const missing = item.options.filter((g) => g.required && !(choices[g.id]?.length > 0))
  const unit = unitPrice(item, item.variants.length ? variantId : null, choiceIds)
  const orderable = canOrder && isOrderable(item)

  const toggle = (groupId: string, choiceId: string, max: number) =>
    setChoices((prev) => {
      const current = prev[groupId] ?? []
      if (max === 1) return { ...prev, [groupId]: current[0] === choiceId ? [] : [choiceId] }
      if (current.includes(choiceId)) return { ...prev, [groupId]: current.filter((c) => c !== choiceId) }
      if (current.length >= max) return prev
      return { ...prev, [groupId]: [...current, choiceId] }
    })

  return (
    <div className="flex flex-col">
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" />
      )}
      <div className={cn("space-y-5", item.image ? "px-5 pt-5" : "")}>
        <div className="pr-10">
          <h3 className="text-[22px] leading-tight font-extrabold tracking-tight">{item.name}</h3>
          {item.description && <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--m-muted)]">{item.description}</p>}
          <p className="mt-2 text-[17px] font-bold tabular-nums">{displayPrice(item, menu.currency)}</p>
          {!item.available && <p className="mt-1 text-sm font-semibold text-[var(--m-muted)]">Momentanément épuisé</p>}
        </div>

        {item.variants.length > 0 && (
          <OptionBlock title="Taille" required>
            {item.variants.map((v) => (
              <ChoiceRow key={v.id} label={v.label} price={formatPrice(v.price, menu.currency)} selected={variantId === v.id} single onClick={() => setVariantId(v.id)} accent={menu.accent} disabled={!orderable} />
            ))}
          </OptionBlock>
        )}

        {item.options.map((group) => {
          const picked = choices[group.id] ?? []
          return (
            <OptionBlock key={group.id} title={group.name} required={group.required} hint={group.max > 1 ? `Jusqu'à ${group.max}` : undefined}>
              {group.choices.map((c) => (
                <ChoiceRow
                  key={c.id}
                  label={c.label}
                  price={c.price > 0 ? `+ ${formatPrice(c.price, menu.currency)}` : ""}
                  selected={picked.includes(c.id)}
                  single={group.max === 1}
                  onClick={() => toggle(group.id, c.id, group.max)}
                  accent={menu.accent}
                  disabled={!orderable || (group.max > 1 && !picked.includes(c.id) && picked.length >= group.max)}
                />
              ))}
            </OptionBlock>
          )
        })}
      </div>

      {orderable && (
        <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-[var(--m-border)] bg-[var(--m-surface)] px-5 pt-4">
          <Stepper value={quantity} onChange={setQuantity} min={1} />
          <button
            type="button"
            disabled={missing.length > 0 || unit === null}
            onClick={() => onAdd(item.variants.length ? variantId : null, choiceIds, quantity)}
            className="flex h-12 flex-1 items-center justify-between rounded-2xl px-4 text-[15px] font-bold transition-opacity disabled:opacity-50"
            style={{ background: menu.accent, color: readableOn(menu.accent) }}
          >
            <span>{missing.length ? `Choisissez : ${missing[0].name.toLowerCase()}` : "Ajouter"}</span>
            {unit !== null && <span className="tabular-nums">{formatPrice(unit * quantity, menu.currency)}</span>}
          </button>
        </div>
      )}
    </div>
  )
}

function OptionBlock({ title, required, hint, children }: { title: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[15px] font-bold">{title}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", required ? "bg-[var(--m-fg)] text-[var(--m-bg)]" : "bg-[var(--m-bg)] text-[var(--m-muted)]")}>
          {required ? "Obligatoire" : hint ?? "Facultatif"}
        </span>
      </div>
      <div className="divide-y divide-[var(--m-border)] rounded-2xl border border-[var(--m-border)]">{children}</div>
    </div>
  )
}

function ChoiceRow({
  label,
  price,
  selected,
  single,
  onClick,
  accent,
  disabled,
}: {
  label: string
  price: string
  selected: boolean
  single: boolean
  onClick: () => void
  accent: string
  disabled?: boolean
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[14.5px] disabled:opacity-50">
      <span
        className={cn("grid size-5 shrink-0 place-items-center border-2 transition-colors", single ? "rounded-full" : "rounded-md")}
        style={{ borderColor: selected ? accent : "var(--m-border)", background: selected ? accent : "transparent" }}
      >
        {selected && (single ? <span className="size-2 rounded-full bg-white" /> : <Check className="size-3.5 text-white" strokeWidth={3} />)}
      </span>
      <span className="flex-1">{label}</span>
      {price && <span className="text-[13.5px] text-[var(--m-muted)] tabular-nums">{price}</span>}
    </button>
  )
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex h-12 items-center rounded-2xl bg-[var(--m-bg)] px-1">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-10 place-items-center rounded-xl disabled:opacity-40" disabled={value <= min} aria-label="Retirer un">
        {value === 1 && min === 0 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
      </button>
      <span className="w-6 text-center text-[15px] font-bold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(50, value + 1))} className="grid size-10 place-items-center rounded-xl" aria-label="Ajouter un">
        <Plus className="size-4" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Panier, coordonnées et envoi                                         */
/* ------------------------------------------------------------------ */

type ResolvedLine = { line: CartLine; item: MenuItem; unit: number; total: number }

const CUSTOMER_KEY = "qrc:customer"

function Checkout({
  menu,
  mode,
  setMode,
  modes,
  lines,
  subtotal,
  onQuantity,
  onClear,
  onClose,
  shortCode,
}: {
  menu: MenuData
  mode: OrderMode
  setMode: (m: OrderMode) => void
  modes: OrderMode[]
  lines: ResolvedLine[]
  subtotal: number
  onQuantity: (key: string, quantity: number) => void
  onClear: () => void
  onClose: () => void
  /** Absent dans les aperçus : l'envoi est simulé */
  shortCode?: string
}) {
  const [step, setStep] = useState<"cart" | "details" | "done">("cart")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ number: number; whatsappUrl: string; trackingUrl: string } | null>(null)
  const [saved] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {}
    try {
      return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}") as Record<string, string>
    } catch {
      return {}
    }
  })

  const accent = menu.accent
  const onAccent = readableOn(accent)
  const fee = mode === "delivery" ? (menu.ordering.deliveryFee ?? 0) : 0
  const total = subtotal + fee
  const min = menu.ordering.minOrder
  const missingMin = min !== null && subtotal < min ? min - subtotal : 0
  const money = (n: number) => formatPrice(n, menu.currency)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const customer = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      table: String(form.get("table") ?? "").trim(),
      note: String(form.get("note") ?? "").trim(),
    }
    setError(null)
    if (customer.name.length < 2) return setError("Indiquez votre nom")
    if (!/^\+?[\d\s().-]{8,24}$/.test(customer.phone)) return setError("Numéro de téléphone invalide")
    if (mode === "delivery" && customer.address.length < 5) return setError("Indiquez l'adresse de livraison")
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: customer.name, phone: customer.phone, address: customer.address }))
    } catch {
      /* ignoré */
    }

    if (!shortCode) {
      // Aperçu (éditeur, démo) : rien n'est envoyé.
      setResult({ number: 42, whatsappUrl: "", trackingUrl: "" })
      setStep("done")
      onClear()
      return
    }
    setBusy(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode,
          mode,
          customer,
          lines: lines.map((l) => ({ itemId: l.item.id, variantId: l.line.variantId, choiceIds: l.line.choiceIds, quantity: l.line.quantity })),
        }),
      })
      const json = (await response.json()) as { error?: string; number: number; whatsappUrl: string; trackingUrl: string }
      if (!response.ok) throw new Error(json.error ?? "La commande n'a pas pu être envoyée")
      setResult(json)
      setStep("done")
      onClear()
    } catch (err) {
      setError(err instanceof Error ? err.message : "La commande n'a pas pu être envoyée")
    } finally {
      setBusy(false)
    }
  }

  if (step === "done" && result) {
    return (
      <div className="py-4 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${accent} 15%, transparent)`, color: accent }}>
          <CircleCheck className="size-9" />
        </span>
        <h3 className="mt-4 text-[22px] font-extrabold tracking-tight">Commande n°{result.number} enregistrée</h3>
        {result.whatsappUrl ? (
          <>
            <p className="mx-auto mt-2 max-w-xs text-[14.5px] text-[var(--m-muted)]">
              Dernière étape : envoyez-la sur WhatsApp pour que {menu.restaurant.name} la confirme.
            </p>
            <a
              href={result.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-[15.5px] font-bold text-white shadow-lg"
            >
              <WhatsAppIcon /> Envoyer sur WhatsApp
            </a>
            <a href={result.trackingUrl} className="mt-3 block py-2 text-[14px] font-semibold" style={{ color: accent }}>
              Suivre ma commande
            </a>
          </>
        ) : (
          <p className="mx-auto mt-2 max-w-xs text-[14px] text-[var(--m-muted)]">Ceci est un aperçu : aucune commande n&apos;a été envoyée.</p>
        )}
        <button type="button" onClick={onClose} className="mt-2 text-[13px] text-[var(--m-muted)] underline underline-offset-4">
          Fermer
        </button>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="py-10 text-center">
        <ShoppingBag className="mx-auto size-10 text-[var(--m-muted)]" />
        <p className="mt-3 font-semibold">Votre panier est vide</p>
        <button type="button" onClick={onClose} className="mt-2 text-sm font-semibold" style={{ color: accent }}>
          Voir la carte
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 pr-10">
        {step === "details" && (
          <button type="button" onClick={() => setStep("cart")} className="grid size-8 place-items-center rounded-full bg-[var(--m-bg)]" aria-label="Retour au panier">
            <ArrowLeft className="size-4" />
          </button>
        )}
        <h3 className="text-[21px] font-extrabold tracking-tight">{step === "cart" ? "Votre commande" : "Vos coordonnées"}</h3>
      </div>

      {modes.length > 1 && (
        <div className="mb-4 flex gap-1.5">
          {modes.map((m) => {
            const Icon = m === "delivery" ? Bike : m === "pickup" ? ShoppingBag : Store
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition-colors", mode !== m && "border-[var(--m-border)] text-[var(--m-muted)]")}
                style={mode === m ? { borderColor: accent, color: accent, background: `color-mix(in oklab, ${accent} 8%, transparent)` } : undefined}
              >
                <Icon className="size-4" />
                {MODE_LABELS[m]}
              </button>
            )
          })}
        </div>
      )}

      {step === "cart" ? (
        <>
          <ul className="divide-y divide-[var(--m-border)]">
            {lines.map(({ line, item, total }) => {
              const variant = item.variants.find((v) => v.id === line.variantId)?.label
              const options = item.options.flatMap((g) => g.choices).filter((c) => line.choiceIds.includes(c.id)).map((c) => c.label)
              return (
                <li key={line.key} className="flex gap-3 py-3">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] leading-snug font-semibold">{item.name}</p>
                    {(variant || options.length > 0) && <p className="text-[12.5px] text-[var(--m-muted)]">{[variant, ...options].filter(Boolean).join(" · ")}</p>}
                    <p className="mt-1 text-[14px] font-bold tabular-nums">{money(total)}</p>
                  </div>
                  <div className="flex h-9 items-center self-center rounded-full bg-[var(--m-bg)]">
                    <button type="button" onClick={() => onQuantity(line.key, line.quantity - 1)} className="grid size-9 place-items-center" aria-label="Retirer un">
                      {line.quantity === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                    </button>
                    <span className="w-5 text-center text-[13.5px] font-bold tabular-nums">{line.quantity}</span>
                    <button type="button" onClick={() => onQuantity(line.key, line.quantity + 1)} className="grid size-9 place-items-center" aria-label="Ajouter un">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <Summary subtotal={subtotal} fee={fee} total={total} mode={mode} money={money} />
          {missingMin > 0 && (
            <p className="mt-3 rounded-xl bg-[var(--m-bg)] px-3 py-2 text-center text-[13px]">
              Encore <strong>{money(missingMin)}</strong> pour atteindre le minimum de commande
            </p>
          )}
          <button
            type="button"
            disabled={missingMin > 0}
            onClick={() => setStep("details")}
            className="mt-4 flex h-13 w-full items-center justify-between rounded-2xl px-5 py-3.5 text-[15.5px] font-bold disabled:opacity-50"
            style={{ background: accent, color: onAccent }}
          >
            <span>Continuer</span>
            <span className="tabular-nums">{money(total)}</span>
          </button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Input name="name" label="Nom" defaultValue={saved.name} autoComplete="name" placeholder="Ex. Awa Koné" />
          <Input name="phone" label="Téléphone" defaultValue={saved.phone} autoComplete="tel" type="tel" placeholder="+225 07 00 00 00 00" />
          {mode === "delivery" && <Input name="address" label="Adresse de livraison" defaultValue={saved.address} autoComplete="street-address" placeholder="Quartier, rue, repère" />}
          {mode === "dine_in" && <Input name="table" label="Numéro de table (facultatif)" placeholder="Ex. 12" />}
          <Input name="note" label="Instructions (facultatif)" placeholder="Sans oignons, sonner au portail…" />
          <Summary subtotal={subtotal} fee={fee} total={total} mode={mode} money={money} />
          {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-center text-[13.5px] font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15.5px] font-bold disabled:opacity-60" style={{ background: accent, color: onAccent }}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : null}
            Commander · {money(total)}
          </button>
          <p className="text-center text-[12px] text-[var(--m-muted)]">Paiement à la livraison ou au comptoir. Votre commande sera envoyée au restaurant par WhatsApp.</p>
        </form>
      )}
    </div>
  )
}

function Summary({ subtotal, fee, total, mode, money }: { subtotal: number; fee: number; total: number; mode: OrderMode; money: (n: number) => string }) {
  return (
    <dl className="mt-4 space-y-1.5 rounded-2xl bg-[var(--m-bg)] p-4 text-[14px]">
      <div className="flex justify-between">
        <dt className="text-[var(--m-muted)]">Sous-total</dt>
        <dd className="tabular-nums">{money(subtotal)}</dd>
      </div>
      {mode === "delivery" && (
        <div className="flex justify-between">
          <dt className="text-[var(--m-muted)]">Livraison</dt>
          <dd className="tabular-nums">{fee === 0 ? "Offerte" : money(fee)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-[var(--m-border)] pt-1.5 text-[15.5px] font-extrabold">
        <dt>Total</dt>
        <dd className="tabular-nums">{money(total)}</dd>
      </div>
    </dl>
  )
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold">{label}</span>
      <input
        {...props}
        className="h-12 w-full rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] px-4 text-[15px] outline-none placeholder:text-[var(--m-muted)] focus:border-[var(--m-accent)] focus:bg-[var(--m-surface)]"
      />
    </label>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  )
}

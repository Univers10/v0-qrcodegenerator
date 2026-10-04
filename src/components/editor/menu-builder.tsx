"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ChevronDown,
  CopyPlus,
  GripVertical,
  ImagePlus,
  LayoutList,
  Loader2,
  Palette,
  Plus,
  Store,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { TAG_COLORS, TAG_ICONS } from "@/components/menu/menu-tags"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CURRENCIES,
  MENU_ACCENTS,
  MENU_TAGS,
  MENU_THEMES,
  emptyItem,
  emptySection,
  formatPrice,
  newId,
  sampleMenu,
  type MenuTag,
} from "@/lib/qr/menu"
import { uploadImage, type ImageKind } from "@/lib/upload"
import { cn } from "@/lib/utils"
import { ColorField } from "./color-field"

type Values = Record<string, unknown>
type Item = Record<string, unknown>
type Section = { items: Item[] } & Record<string, unknown>
type Variant = { id: string; label: string; price: unknown }

type Props = {
  values: Values
  errors: Record<string, string>
  onChange: (values: Values) => void
  canUpload: boolean
}

const SECTION_SUGGESTIONS = ["Entrées", "Plats", "Desserts", "Boissons", "Formules", "Pizzas", "Burgers", "Grillades", "Salades", "Cocktails", "Vins"]

const str = (v: unknown) => (typeof v === "string" ? v : v === null || v === undefined ? "" : String(v))
const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\s/g, "").replace(",", "."))
  return str(v).trim() !== "" && Number.isFinite(n) ? n : null
}

export function MenuBuilder({ values, errors, onChange, canUpload }: Props) {
  const restaurant = (values.restaurant ?? {}) as Record<string, unknown>
  const sections = (Array.isArray(values.sections) ? values.sections : []) as Section[]
  const currency = str(values.currency) || "EUR"
  const [selectedId, setSelectedId] = useState<string>(() => str(sections[0]?.id))
  const [expanded, setExpanded] = useState<string | null>(null)

  const set = (patch: Values) => onChange({ ...values, ...patch })
  const setRestaurant = (patch: Record<string, unknown>) => set({ restaurant: { ...restaurant, ...patch } })
  const setSections = (next: Section[]) => set({ sections: next })

  const selectedIndex = Math.max(0, sections.findIndex((s) => str(s.id) === selectedId))
  const section = sections[selectedIndex]

  const setSection = (patch: Record<string, unknown>) => setSections(sections.map((s, k) => (k === selectedIndex ? { ...s, ...patch } : s)))
  const setItem = (j: number, patch: Record<string, unknown>) =>
    setSection({ items: section.items.map((it, k) => (k === j ? { ...it, ...patch } : it)) })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const isEmpty = !str(restaurant.name) && sections.every((s) => s.items.every((it) => !str(it.name)))
  const err = (path: string) => errors[path]
  const sectionHasError = (i: number) => Object.keys(errors).some((k) => k.startsWith(`sections.${i}.`) || k === `sections.${i}`)
  const establishmentError = Object.keys(errors).some((k) => k.startsWith("restaurant."))

  const addSection = (name = "") => {
    const created = emptySection(name) as Section
    setSections([...sections, created])
    setSelectedId(str(created.id))
    setExpanded(str(created.items[0]?.id))
  }

  const addItem = () => {
    const created = emptyItem()
    setSection({ items: [...section.items, created] })
    setExpanded(str(created.id))
  }

  const onSectionsDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = sections.findIndex((s) => str(s.id) === active.id)
    const to = sections.findIndex((s) => str(s.id) === over.id)
    setSections(arrayMove(sections, from, to))
  }

  const onItemsDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = section.items.findIndex((it) => str(it.id) === active.id)
    const to = section.items.findIndex((it) => str(it.id) === over.id)
    setSection({ items: arrayMove(section.items, from, to) })
  }

  return (
    <div className="space-y-5">
      {isEmpty && (
        <div className="flex flex-col gap-3 overflow-hidden rounded-xl border bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:flex-row sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <WandSparkles className="size-5" />
          </span>
          <p className="flex-1 text-sm">
            <span className="font-medium">Démarrez avec une carte complète</span>
            <span className="block text-muted-foreground">12 plats en 4 catégories, avec photos, prix et étiquettes, à adapter.</span>
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const sample = sampleMenu()
              onChange(sample)
              const first = (sample.sections as Section[])[0]
              setSelectedId(str(first.id))
              setExpanded(null)
            }}
          >
            Charger l&apos;exemple
          </Button>
        </div>
      )}

      <Tabs defaultValue="carte" className="gap-5">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="carte" className="gap-1.5">
            <LayoutList className="size-4" /> Carte
            {Object.keys(errors).some((k) => k.startsWith("sections")) && <ErrorDot />}
          </TabsTrigger>
          <TabsTrigger value="etablissement" className="gap-1.5">
            <Store className="size-4" /> Établissement
            {establishmentError && <ErrorDot />}
          </TabsTrigger>
          <TabsTrigger value="apparence" className="gap-1.5">
            <Palette className="size-4" /> Apparence
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- Carte */}
        <TabsContent value="carte" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Catégories</span>
              <span className="text-xs text-muted-foreground">Glissez pour réordonner</span>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionsDragEnd}>
              <SortableContext items={sections.map((s) => str(s.id))} strategy={horizontalListSortingStrategy}>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-1 pb-2">
                  {sections.map((s, i) => (
                    <SortableChip
                      key={str(s.id)}
                      id={str(s.id)}
                      label={str(s.name) || "Sans nom"}
                      count={s.items.length}
                      active={i === selectedIndex}
                      error={sectionHasError(i)}
                      onSelect={() => {
                        setSelectedId(str(s.id))
                        setExpanded(null)
                      }}
                    />
                  ))}
                  <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 rounded-full border-dashed" onClick={() => addSection()}>
                    <Plus /> Catégorie
                  </Button>
                </div>
              </SortableContext>
            </DndContext>
            {sections.length < 6 && (
              <div className="flex flex-wrap gap-1.5">
                {SECTION_SUGGESTIONS.filter((name) => !sections.some((s) => str(s.name) === name))
                  .slice(0, 6)
                  .map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addSection(name)}
                      className="rounded-full px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      + {name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {section && (
            <div className="overflow-hidden rounded-xl border">
              <div className="flex items-start gap-3 border-b bg-muted/30 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    value={str(section.name)}
                    onChange={(e) => setSection({ name: e.target.value })}
                    placeholder="Nom de la catégorie"
                    maxLength={60}
                    aria-label="Nom de la catégorie"
                    className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/60"
                  />
                  <input
                    value={str(section.description)}
                    onChange={(e) => setSection({ description: e.target.value })}
                    placeholder="Ajouter une description (facultatif)"
                    maxLength={200}
                    aria-label="Description de la catégorie"
                    className="w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  {err(`sections.${selectedIndex}.name`) && <p className="text-xs text-destructive">{err(`sections.${selectedIndex}.name`)}</p>}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={sections.length <= 1}
                      className="hover:text-destructive"
                      aria-label="Supprimer la catégorie"
                      onClick={() => {
                        const next = sections.filter((_, k) => k !== selectedIndex)
                        setSections(next)
                        setSelectedId(str(next[Math.max(0, selectedIndex - 1)]?.id))
                        toast("Catégorie supprimée", {
                          action: { label: "Annuler", onClick: () => onChange({ ...values, sections }) },
                        })
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer la catégorie</TooltipContent>
                </Tooltip>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onItemsDragEnd}>
                <SortableContext items={section.items.map((it) => str(it.id))} strategy={verticalListSortingStrategy}>
                  <ul className="divide-y">
                    {section.items.map((item, j) => (
                      <SortableItemRow
                        key={str(item.id)}
                        item={item}
                        currency={currency}
                        open={expanded === str(item.id)}
                        onToggle={() => setExpanded(expanded === str(item.id) ? null : str(item.id))}
                        onChange={(patch) => setItem(j, patch)}
                        onDuplicate={() => {
                          const copy = {
                            ...item,
                            id: newId(),
                            name: `${str(item.name)} (copie)`.trim(),
                            variants: ((item.variants as Variant[] | undefined) ?? []).map((v) => ({ ...v, id: newId() })),
                          }
                          const items = [...section.items]
                          items.splice(j + 1, 0, copy)
                          setSection({ items })
                          setExpanded(copy.id)
                        }}
                        onDelete={
                          section.items.length > 1
                            ? () => {
                                setSection({ items: section.items.filter((_, k) => k !== j) })
                                toast("Plat supprimé", { action: { label: "Annuler", onClick: () => onChange({ ...values, sections }) } })
                              }
                            : undefined
                        }
                        errors={{
                          name: err(`sections.${selectedIndex}.items.${j}.name`),
                          price: err(`sections.${selectedIndex}.items.${j}.price`),
                          variants: Object.entries(errors).find(([k]) => k.startsWith(`sections.${selectedIndex}.items.${j}.variants`))?.[1],
                        }}
                        canUpload={canUpload}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>

              <div className="border-t bg-muted/20 p-2">
                <Button type="button" variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={addItem}>
                  <Plus /> Ajouter un plat
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ---------------------------------------------------------------- Établissement */}
        <TabsContent value="etablissement" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
            <ImageField
              label="Logo"
              kind="logo"
              value={str(restaurant.logo) || null}
              onChange={(logo) => setRestaurant({ logo })}
              canUpload={canUpload}
              aspect="aspect-square"
              hint="Carré"
            />
            <ImageField
              label="Photo de couverture"
              kind="cover"
              value={str(restaurant.cover) || null}
              onChange={(cover) => setRestaurant({ cover })}
              canUpload={canUpload}
              aspect="aspect-[16/7]"
              hint="Salle, façade ou plat signature"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom de l'établissement" error={err("restaurant.name")} className="sm:col-span-2">
              <Input value={str(restaurant.name)} onChange={(e) => setRestaurant({ name: e.target.value })} placeholder="Le Bistrot des Halles" maxLength={80} />
            </Field>
            <Field label="Type de cuisine" hint="Affiché au-dessus du nom">
              <Input value={str(restaurant.cuisine)} onChange={(e) => setRestaurant({ cuisine: e.target.value })} placeholder="Bistronomie · Français" maxLength={80} />
            </Field>
            <Field label="Accroche">
              <Input value={str(restaurant.tagline)} onChange={(e) => setRestaurant({ tagline: e.target.value })} placeholder="Cuisine de marché et produits frais" maxLength={120} />
            </Field>
            <Field label="Horaires" className="sm:col-span-2">
              <Input value={str(restaurant.hours)} onChange={(e) => setRestaurant({ hours: e.target.value })} placeholder="Mar – Sam · 12 h – 14 h 30, 19 h – 22 h 30" maxLength={200} />
            </Field>
            <Field label="Téléphone">
              <Input type="tel" value={str(restaurant.phone)} onChange={(e) => setRestaurant({ phone: e.target.value })} placeholder="+33 1 42 00 00 00" maxLength={30} />
            </Field>
            <Field label="Site web">
              <Input value={str(restaurant.website)} onChange={(e) => setRestaurant({ website: e.target.value })} placeholder="bistrot-des-halles.fr" maxLength={200} />
            </Field>
            <Field label="Adresse" className="sm:col-span-2">
              <Input value={str(restaurant.address)} onChange={(e) => setRestaurant({ address: e.target.value })} placeholder="12 rue Montorgueil, 75002 Paris" maxLength={200} />
            </Field>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">Wi-Fi clients</p>
            <p className="mb-3 text-xs text-muted-foreground">Vos clients copient le mot de passe en un geste depuis la carte.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={str(restaurant.wifiSsid)} onChange={(e) => setRestaurant({ wifiSsid: e.target.value })} placeholder="Nom du réseau" maxLength={64} aria-label="Nom du réseau Wi-Fi" />
              <Input
                value={str(restaurant.wifiPassword)}
                onChange={(e) => setRestaurant({ wifiPassword: e.target.value })}
                placeholder="Mot de passe"
                maxLength={128}
                autoComplete="off"
                aria-label="Mot de passe Wi-Fi"
              />
            </div>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------------- Apparence */}
        <TabsContent value="apparence" className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium">Style de carte</span>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Style de carte">
              {MENU_THEMES.map((theme) => {
                const on = (values.theme ?? "modern") === theme.value
                return (
                  <button
                    key={theme.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set({ theme: theme.value })}
                    className={cn("overflow-hidden rounded-xl border text-left transition-all hover:border-primary/40", on && "border-primary ring-1 ring-primary")}
                  >
                    <ThemeThumb theme={theme} accent={str(values.accent) || "#b45309"} />
                    <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
                      <span>
                        <span className="block text-sm font-medium">{theme.label}</span>
                        <span className="text-[11px] text-muted-foreground">{theme.hint}</span>
                      </span>
                      {on && <Badge className="h-5 px-1.5 text-[10px]">Actif</Badge>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <ColorField label="Couleur d'accent" value={str(values.accent) || "#b45309"} onChange={(accent) => set({ accent })} swatches={MENU_ACCENTS} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium">Devise</span>
              <Select value={currency} onValueChange={(c) => set({ currency: c })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Exemple : {formatPrice(12.5, currency)}</p>
            </div>
          </div>
          <Field label="Mention de bas de carte">
            <Textarea value={str(values.note)} onChange={(e) => set({ note: e.target.value })} rows={2} maxLength={300} placeholder="Prix nets, service compris…" />
          </Field>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function ErrorDot() {
  return <span className="size-1.5 rounded-full bg-destructive" aria-label="Champs à corriger" />
}

function SortableChip({
  id,
  label,
  count,
  active,
  error,
  onSelect,
}: {
  id: string
  label: string
  count: number
  active: boolean
  error: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex h-9 shrink-0 cursor-grab touch-none items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors active:cursor-grabbing",
        active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-background hover:bg-accent",
        isDragging && "z-10 opacity-80 shadow-lg",
        error && !active && "border-destructive/60",
      )}
      {...attributes}
      {...listeners}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>{count}</span>
      {error && <ErrorDot />}
    </button>
  )
}

function SortableItemRow({
  item,
  currency,
  open,
  onToggle,
  onChange,
  onDuplicate,
  onDelete,
  errors,
  canUpload,
}: {
  item: Item
  currency: string
  open: boolean
  onToggle: () => void
  onChange: (patch: Record<string, unknown>) => void
  onDuplicate: () => void
  onDelete?: () => void
  errors: { name?: string; price?: string; variants?: string }
  canUpload: boolean
}) {
  const id = str(item.id)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const tags = (Array.isArray(item.tags) ? item.tags : []) as MenuTag[]
  const variants = (Array.isArray(item.variants) ? item.variants : []) as Variant[]
  const hasError = Boolean(errors.name || errors.price || errors.variants)
  const priceLabel = (() => {
    const p = toNum(item.price)
    if (p !== null) return formatPrice(p, currency)
    const v = variants.map((x) => toNum(x.price)).filter((n): n is number => n !== null)
    return v.length ? `dès ${formatPrice(Math.min(...v), currency)}` : "—"
  })()

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("bg-background", isDragging && "relative z-10 shadow-xl", open && "bg-muted/20")}
    >
      <div className="flex items-center gap-2 px-2 py-2.5 sm:gap-3 sm:px-3">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground/60 hover:bg-accent hover:text-foreground active:cursor-grabbing"
          aria-label="Déplacer le plat"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
          <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {str(item.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={str(item.image)} alt="" className="size-full object-cover" />
            ) : (
              <ImagePlus className="absolute inset-0 m-auto size-4 text-muted-foreground/50" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-sm font-medium", !str(item.name) && "text-muted-foreground italic", hasError && "text-destructive")}>
              {str(item.name) || "Nouveau plat"}
            </span>
            <span className="flex items-center gap-1.5">
              {tags.slice(0, 4).map((t) => {
                const Icon = TAG_ICONS[t]
                return <Icon key={t} className="size-3" style={{ color: TAG_COLORS[t] }} />
              })}
              <span className="truncate text-xs text-muted-foreground">{str(item.description)}</span>
            </span>
          </span>
          <span className={cn("shrink-0 text-sm font-medium tabular-nums", item.available === false && "text-muted-foreground line-through")}>{priceLabel}</span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="grid gap-4 border-t border-dashed px-3 pt-4 pb-4 sm:grid-cols-[104px_1fr] sm:px-4">
          <ImageField kind="item" value={str(item.image) || null} onChange={(image) => onChange({ image })} canUpload={canUpload} aspect="aspect-square" />
          <div className="min-w-0 space-y-3">
            <div className="grid gap-3 xl:grid-cols-[1fr_140px]">
              <Field label="Nom" error={errors.name}>
                <Input
                  autoFocus={!str(item.name)}
                  value={str(item.name)}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="Ex. Risotto aux cèpes"
                  maxLength={80}
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <Field label="Prix" error={errors.price}>
                <div className="relative">
                  <Input
                    value={str(item.price)}
                    onChange={(e) => onChange({ price: e.target.value })}
                    placeholder={variants.length ? "Voir variantes" : "0,00"}
                    inputMode="decimal"
                    className="pr-12 text-right tabular-nums"
                    aria-invalid={Boolean(errors.price)}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">{currency}</span>
                </div>
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={str(item.description)}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Ingrédients, préparation, accompagnement…"
                rows={2}
                maxLength={300}
                className="min-h-0"
              />
            </Field>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Déclinaisons de prix</Label>
                {variants.length < 5 && (
                  <button
                    type="button"
                    onClick={() => onChange({ variants: [...variants, { id: newId(), label: "", price: "" }] })}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    + Ajouter
                  </button>
                )}
              </div>
              {variants.length === 0 ? (
                <p className="text-xs text-muted-foreground">Verre / bouteille, tailles, formules… (facultatif)</p>
              ) : (
                <div className="space-y-2">
                  {variants.map((v, k) => (
                    <div key={v.id} className="flex gap-2">
                      <Input
                        value={str(v.label)}
                        onChange={(e) => onChange({ variants: variants.map((x, i) => (i === k ? { ...x, label: e.target.value } : x)) })}
                        placeholder="Ex. Verre 12 cl"
                        maxLength={30}
                        className="h-8 text-sm"
                        aria-label="Libellé de la déclinaison"
                      />
                      <Input
                        value={str(v.price)}
                        onChange={(e) => onChange({ variants: variants.map((x, i) => (i === k ? { ...x, price: e.target.value } : x)) })}
                        placeholder="Prix"
                        inputMode="decimal"
                        className="h-8 w-24 text-right text-sm tabular-nums"
                        aria-label="Prix de la déclinaison"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 shrink-0"
                        onClick={() => onChange({ variants: variants.filter((_, i) => i !== k) })}
                        aria-label="Retirer la déclinaison"
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                  {errors.variants && <p className="text-xs text-destructive">{errors.variants}</p>}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Étiquettes</Label>
              <div className="flex flex-wrap gap-1.5">
                {MENU_TAGS.map((tag) => {
                  const on = tags.includes(tag.value)
                  const Icon = TAG_ICONS[tag.value]
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onChange({ tags: on ? tags.filter((t) => t !== tag.value) : [...tags, tag.value] })}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        !on && "text-muted-foreground hover:bg-accent",
                      )}
                      style={
                        on
                          ? { background: `color-mix(in oklab, ${TAG_COLORS[tag.value]} 14%, transparent)`, borderColor: TAG_COLORS[tag.value], color: TAG_COLORS[tag.value] }
                          : undefined
                      }
                    >
                      <Icon className="size-3.5" />
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={item.available !== false} onCheckedChange={(available) => onChange({ available })} />
                {item.available !== false ? "Disponible" : "Épuisé aujourd'hui"}
              </label>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={onDuplicate}>
                  <CopyPlus /> Dupliquer
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={onDelete} disabled={!onDelete} className="hover:text-destructive">
                  <Trash2 /> Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

function ThemeThumb({ theme, accent }: { theme: (typeof MENU_THEMES)[number]; accent: string }) {
  const fg = theme.foreground
  if (theme.layout === "app") {
    return (
      <div className="h-24 p-2.5" style={{ background: theme.background }}>
        <div className="h-9 rounded-md" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 50%, black))` }} />
        {[0, 1].map((i) => (
          <div key={i} className="mt-1.5 flex items-center gap-1.5">
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-3/4 rounded-full" style={{ background: fg, opacity: 0.8 }} />
              <div className="h-1 w-1/2 rounded-full" style={{ background: fg, opacity: 0.25 }} />
            </div>
            <div className="size-5 rounded" style={{ background: fg, opacity: 0.15 }} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex h-24 flex-col items-center p-2.5" style={{ background: theme.background }}>
      <div className="h-1.5 w-1/2 rounded-full" style={{ background: fg, opacity: 0.85 }} />
      <div className="mt-1 h-px w-8" style={{ background: accent }} />
      <div className="mt-2 h-1 w-1/4 rounded-full" style={{ background: fg, opacity: 0.4 }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mt-1.5 flex w-full items-center gap-1">
          <div className="h-1.5 w-1/3 rounded-full" style={{ background: fg, opacity: 0.75 }} />
          <div className="flex-1 border-b border-dotted" style={{ borderColor: fg, opacity: 0.3 }} />
          <div className="h-1.5 w-3 rounded-full" style={{ background: fg, opacity: 0.75 }} />
        </div>
      ))}
    </div>
  )
}

function Field({ label, error, hint, className, children }: { label: string; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function ImageField({
  label,
  kind,
  value,
  onChange,
  canUpload,
  aspect,
  hint,
}: {
  label?: string
  kind: ImageKind
  value: string | null
  onChange: (url: string | null) => void
  canUpload: boolean
  aspect: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  const pick = async (file?: File) => {
    if (!file || !canUpload) return
    setBusy(true)
    try {
      onChange(await uploadImage(file, kind))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'envoi de l'image")
    } finally {
      setBusy(false)
    }
  }

  const box = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-muted/40 transition-colors",
        aspect,
        dragging && "border-primary bg-primary/5",
        !value && "border-dashed",
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        pick(e.dataTransfer.files[0])
      }}
    >
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {canUpload && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-zinc-900 hover:bg-white"
              >
                Remplacer
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="grid size-6 place-items-center rounded-md bg-white/90 text-zinc-900 hover:bg-white"
              aria-label="Retirer l'image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={!canUpload || busy}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={label ? `Ajouter : ${label}` : "Ajouter une photo"}
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-[11px] leading-tight">{busy ? "Envoi…" : hint ?? "Photo"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = ""
        }}
      />
    </div>
  )

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      {canUpload ? (
        box
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{box}</div>
          </TooltipTrigger>
          <TooltipContent>Créez un compte gratuit pour ajouter vos photos</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

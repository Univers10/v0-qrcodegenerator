"use client"

import {
  ArrowDown,
  ArrowUp,
  CopyPlus,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { TAG_COLORS, TAG_ICONS } from "@/components/menu/menu-tags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CURRENCIES, MENU_TAGS, MENU_THEMES, emptyItem, emptySection, newId, sampleMenu, type MenuTag } from "@/lib/qr/menu"
import { uploadImage, type ImageKind } from "@/lib/upload"
import { cn } from "@/lib/utils"
import { ColorField } from "./color-field"

type Values = Record<string, unknown>
type Item = Record<string, unknown>
type Section = { items: Item[] } & Record<string, unknown>

type Props = {
  values: Values
  errors: Record<string, string>
  onChange: (values: Values) => void
  canUpload: boolean
}

const SECTION_SUGGESTIONS = ["Entrées", "Plats", "Desserts", "Boissons", "Formules", "Pizzas", "Grillades", "Cocktails"]
const ACCENTS = ["#b45309", "#b91c1c", "#be185d", "#7c3aed", "#1d4ed8", "#0f766e", "#15803d", "#c2a15b", "#1c1917"]

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list]
  const [entry] = next.splice(from, 1)
  next.splice(to, 0, entry)
  return next
}

export function MenuBuilder({ values, errors, onChange, canUpload }: Props) {
  const restaurant = (values.restaurant ?? {}) as Record<string, unknown>
  const sections = (Array.isArray(values.sections) ? values.sections : []) as Section[]
  const str = (v: unknown) => (typeof v === "string" ? v : v === null || v === undefined ? "" : String(v))

  const set = (patch: Values) => onChange({ ...values, ...patch })
  const setRestaurant = (patch: Record<string, unknown>) => set({ restaurant: { ...restaurant, ...patch } })
  const setSections = (next: Section[]) => set({ sections: next })
  const setSection = (i: number, patch: Record<string, unknown>) => setSections(sections.map((s, k) => (k === i ? { ...s, ...patch } : s)))
  const setItem = (i: number, j: number, patch: Record<string, unknown>) =>
    setSection(i, { items: sections[i].items.map((it, k) => (k === j ? { ...it, ...patch } : it)) })

  const isEmpty = !str(restaurant.name) && sections.every((s) => s.items.every((it) => !str(it.name)))

  const err = (path: string) => errors[path]

  return (
    <div className="space-y-6">
      {isEmpty && (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] p-4 sm:flex-row sm:items-center">
          <WandSparkles className="size-5 shrink-0 text-primary" />
          <p className="flex-1 text-sm">
            <span className="font-medium">Gagnez du temps :</span>{" "}
            <span className="text-muted-foreground">partez d&apos;un menu d&apos;exemple complet et adaptez-le.</span>
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(sampleMenu())}>
            Charger l&apos;exemple
          </Button>
        </div>
      )}

      {/* Établissement */}
      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold">Établissement</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ImageField
            label="Logo"
            kind="logo"
            value={str(restaurant.logo) || null}
            onChange={(logo) => setRestaurant({ logo })}
            canUpload={canUpload}
            className="sm:w-28"
            aspect="aspect-square"
          />
          <ImageField
            label="Photo de couverture"
            kind="cover"
            value={str(restaurant.cover) || null}
            onChange={(cover) => setRestaurant({ cover })}
            canUpload={canUpload}
            className="flex-1"
            aspect="aspect-[16/7]"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de l'établissement" error={err("restaurant.name")} className="sm:col-span-2">
            <Input value={str(restaurant.name)} onChange={(e) => setRestaurant({ name: e.target.value })} placeholder="Le Bistrot des Halles" maxLength={80} />
          </Field>
          <Field label="Accroche" className="sm:col-span-2">
            <Input value={str(restaurant.tagline)} onChange={(e) => setRestaurant({ tagline: e.target.value })} placeholder="Cuisine de marché et produits frais" maxLength={120} />
          </Field>
          <Field label="Horaires">
            <Input value={str(restaurant.hours)} onChange={(e) => setRestaurant({ hours: e.target.value })} placeholder="Mar – Sam · 12 h – 22 h" maxLength={200} />
          </Field>
          <Field label="Téléphone">
            <Input type="tel" value={str(restaurant.phone)} onChange={(e) => setRestaurant({ phone: e.target.value })} placeholder="+33 1 42 00 00 00" maxLength={30} />
          </Field>
          <Field label="Adresse" className="sm:col-span-2">
            <Input value={str(restaurant.address)} onChange={(e) => setRestaurant({ address: e.target.value })} placeholder="12 rue Montorgueil, 75002 Paris" maxLength={200} />
          </Field>
          <Field label="Wi-Fi clients (nom du réseau)">
            <Input value={str(restaurant.wifiSsid)} onChange={(e) => setRestaurant({ wifiSsid: e.target.value })} placeholder="Facultatif" maxLength={64} />
          </Field>
          <Field label="Mot de passe Wi-Fi">
            <Input value={str(restaurant.wifiPassword)} onChange={(e) => setRestaurant({ wifiPassword: e.target.value })} placeholder="Facultatif" maxLength={128} autoComplete="off" />
          </Field>
        </div>
      </fieldset>

      {/* Apparence */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="mb-3 text-sm font-semibold">Apparence de la carte</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Thème du menu">
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
                <div className="space-y-1.5 p-3" style={{ background: theme.background, color: theme.foreground }}>
                  <div className="h-2 w-3/5 rounded-full" style={{ background: theme.foreground, opacity: 0.85 }} />
                  <div className="h-1.5 w-4/5 rounded-full" style={{ background: theme.foreground, opacity: 0.25 }} />
                  <div className="h-1.5 w-2/5 rounded-full" style={{ background: str(values.accent) || "#b45309" }} />
                </div>
                <div className="border-t px-3 py-2">
                  <span className="block text-sm font-medium">{theme.label}</span>
                  <span className="text-[11px] text-muted-foreground">{theme.hint}</span>
                </div>
              </button>
            )
          })}
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <ColorField label="Couleur d'accent" value={str(values.accent) || "#b45309"} onChange={(accent) => set({ accent })} swatches={ACCENTS} />
          <div className="space-y-2">
            <span className="text-sm font-medium">Devise</span>
            <Select value={str(values.currency) || "EUR"} onValueChange={(currency) => set({ currency })}>
              <SelectTrigger className="w-full sm:w-56">
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
          </div>
        </div>
        <Field label="Mention de bas de carte">
          <Textarea value={str(values.note)} onChange={(e) => set({ note: e.target.value })} rows={2} maxLength={300} placeholder="Prix nets, service compris…" />
        </Field>
      </fieldset>

      {/* Catégories et plats */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="mb-3 text-sm font-semibold">
          Carte <span className="font-normal text-muted-foreground">· {sections.length} catégorie{sections.length > 1 ? "s" : ""}</span>
        </legend>
        {err("sections") && <p className="text-xs text-destructive">{err("sections")}</p>}

        {sections.map((section, i) => (
          <div key={str(section.id) || i} className="rounded-xl border bg-muted/20">
            <div className="flex items-start gap-2 border-b p-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  value={str(section.name)}
                  onChange={(e) => setSection(i, { name: e.target.value })}
                  placeholder="Nom de la catégorie"
                  className="h-9 bg-background font-medium"
                  aria-label="Nom de la catégorie"
                  aria-invalid={Boolean(err(`sections.${i}.name`))}
                  maxLength={60}
                />
                {err(`sections.${i}.name`) && <p className="text-xs text-destructive">{err(`sections.${i}.name`)}</p>}
                <Input
                  value={str(section.description)}
                  onChange={(e) => setSection(i, { description: e.target.value })}
                  placeholder="Description (facultatif)"
                  className="h-8 bg-background text-xs"
                  aria-label="Description de la catégorie"
                  maxLength={200}
                />
              </div>
              <RowActions
                onUp={i > 0 ? () => setSections(move(sections, i, i - 1)) : undefined}
                onDown={i < sections.length - 1 ? () => setSections(move(sections, i, i + 1)) : undefined}
                onDelete={sections.length > 1 ? () => setSections(sections.filter((_, k) => k !== i)) : undefined}
                label="la catégorie"
              />
            </div>

            <ul className="divide-y">
              {section.items.map((item, j) => (
                <li key={str(item.id) || j} className="p-3">
                  <div className="flex gap-3">
                    <ImageField
                      kind="item"
                      value={str(item.image) || null}
                      onChange={(image) => setItem(i, j, { image })}
                      canUpload={canUpload}
                      className="w-16 shrink-0 sm:w-20"
                      aspect="aspect-square"
                      compact
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={str(item.name)}
                          onChange={(e) => setItem(i, j, { name: e.target.value })}
                          placeholder="Nom du plat"
                          className="h-9 bg-background"
                          aria-label="Nom du plat"
                          aria-invalid={Boolean(err(`sections.${i}.items.${j}.name`))}
                          maxLength={80}
                        />
                        <div className="relative w-28 shrink-0">
                          <Input
                            value={str(item.price)}
                            onChange={(e) => setItem(i, j, { price: e.target.value })}
                            placeholder="Prix"
                            inputMode="decimal"
                            className="h-9 bg-background pr-12 text-right tabular-nums"
                            aria-label="Prix"
                            aria-invalid={Boolean(err(`sections.${i}.items.${j}.price`))}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] text-muted-foreground">
                            {str(values.currency) || "EUR"}
                          </span>
                        </div>
                      </div>
                      {(err(`sections.${i}.items.${j}.name`) || err(`sections.${i}.items.${j}.price`)) && (
                        <p className="text-xs text-destructive">{err(`sections.${i}.items.${j}.name`) ?? err(`sections.${i}.items.${j}.price`)}</p>
                      )}
                      <Textarea
                        value={str(item.description)}
                        onChange={(e) => setItem(i, j, { description: e.target.value })}
                        placeholder="Description, ingrédients…"
                        rows={2}
                        className="min-h-0 bg-background text-sm"
                        aria-label="Description du plat"
                        maxLength={300}
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
                        {MENU_TAGS.map((tag) => {
                          const tags = (Array.isArray(item.tags) ? item.tags : []) as MenuTag[]
                          const on = tags.includes(tag.value)
                          const Icon = TAG_ICONS[tag.value]
                          return (
                            <button
                              key={tag.value}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setItem(i, j, { tags: on ? tags.filter((t) => t !== tag.value) : [...tags, tag.value] })}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors",
                                !on && "text-muted-foreground hover:bg-accent",
                              )}
                              style={on ? { background: `color-mix(in oklab, ${TAG_COLORS[tag.value]} 14%, transparent)`, borderColor: TAG_COLORS[tag.value], color: TAG_COLORS[tag.value] } : undefined}
                            >
                              <Icon className="size-3" />
                              {tag.label}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch checked={item.available !== false} onCheckedChange={(available) => setItem(i, j, { available })} />
                          {item.available !== false ? "Disponible" : "Épuisé"}
                        </label>
                        <RowActions
                          onUp={j > 0 ? () => setSection(i, { items: move(section.items, j, j - 1) }) : undefined}
                          onDown={j < section.items.length - 1 ? () => setSection(i, { items: move(section.items, j, j + 1) }) : undefined}
                          onDuplicate={() => {
                            const copy = { ...item, id: newId(), name: `${str(item.name)} (copie)`.trim() }
                            const items = [...section.items]
                            items.splice(j + 1, 0, copy)
                            setSection(i, { items })
                          }}
                          onDelete={section.items.length > 1 ? () => setSection(i, { items: section.items.filter((_, k) => k !== j) }) : undefined}
                          label="le plat"
                          horizontal
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => setSection(i, { items: [...section.items, emptyItem()] })}
              >
                <Plus /> Ajouter un plat
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-2 rounded-xl border border-dashed p-3">
          <Button type="button" variant="outline" className="w-full" onClick={() => setSections([...sections, emptySection() as Section])}>
            <Plus /> Ajouter une catégorie
          </Button>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SECTION_SUGGESTIONS.filter((name) => !sections.some((s) => str(s.name) === name)).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSections([...sections, emptySection(name) as Section])}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      </fieldset>
    </div>
  )
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function RowActions({
  onUp,
  onDown,
  onDuplicate,
  onDelete,
  label,
  horizontal,
}: {
  onUp?: () => void
  onDown?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  label: string
  horizontal?: boolean
}) {
  return (
    <div className={cn("flex shrink-0 gap-0.5", !horizontal && "flex-col sm:flex-row")}>
      <Button type="button" variant="ghost" size="icon-xs" onClick={onUp} disabled={!onUp} aria-label={`Monter ${label}`}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" onClick={onDown} disabled={!onDown} aria-label={`Descendre ${label}`}>
        <ArrowDown />
      </Button>
      {onDuplicate && (
        <Button type="button" variant="ghost" size="icon-xs" onClick={onDuplicate} aria-label={`Dupliquer ${label}`}>
          <CopyPlus />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onDelete}
        disabled={!onDelete}
        className="hover:text-destructive"
        aria-label={`Supprimer ${label}`}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

function ImageField({
  label,
  kind,
  value,
  onChange,
  canUpload,
  className,
  aspect,
  compact,
}: {
  label?: string
  kind: ImageKind
  value: string | null
  onChange: (url: string | null) => void
  canUpload: boolean
  className?: string
  aspect: string
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const pick = async (file?: File) => {
    if (!file) return
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
    <div className={cn("relative overflow-hidden rounded-lg border bg-background", aspect)}>
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Retirer l'image"
          >
            <X className="size-3.5" />
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={!canUpload || busy}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={label ? `Ajouter : ${label}` : "Ajouter une photo"}
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className={compact ? "size-4" : "size-5"} />}
          {!compact && <span className="text-xs">{busy ? "Envoi…" : "Ajouter"}</span>}
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
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      {canUpload ? (
        box
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{box}</div>
          </TooltipTrigger>
          <TooltipContent>Créez un compte gratuit pour ajouter des photos</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

"use client"

import { ImagePlus, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { QrImage } from "@/components/qr/qr-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CORNER_DOT_STYLES,
  CORNER_SQUARE_STYLES,
  DEFAULT_DESIGN,
  DESIGN_TEMPLATES,
  DOT_STYLES,
  ERROR_LEVELS,
  FRAME_STYLES,
  applyTemplate,
  type QrDesign,
} from "@/lib/qr/design"
import { normalizeLogo } from "@/lib/qr/render"
import { cn } from "@/lib/utils"
import { ColorField } from "./color-field"

type Props = { design: QrDesign; onChange: (design: QrDesign) => void }

const TEMPLATE_PAYLOAD = "https://qrcreator.app"
// Aperçus calculés une seule fois : les vignettes ne se régénèrent pas à chaque frappe.
const TEMPLATE_PREVIEWS = DESIGN_TEMPLATES.map((t) => ({ ...t, preview: applyTemplate(DEFAULT_DESIGN, t.design) }))
const FRAME_TEXTS = ["SCANNEZ-MOI", "MENU", "WI-FI GRATUIT", "LAISSEZ UN AVIS", "PLUS D'INFOS", "CONTACT"]

export function DesignPanel({ design, onChange }: Props) {
  const set = <K extends keyof QrDesign>(key: K, patch: Partial<QrDesign[K]>) =>
    onChange({ ...design, [key]: { ...(design[key] as object), ...patch } })

  return (
    <Tabs defaultValue="templates" className="gap-5">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className="w-max min-w-full">
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="pattern">Motif</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="frame">Cadre</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="templates">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMPLATE_PREVIEWS.map(({ preview, ...t }) => {
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(applyTemplate(design, t.design))}
                className="group rounded-xl border bg-card p-2 text-left transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="overflow-hidden rounded-lg" style={{ background: preview.background.color }}>
                  <QrImage payload={TEMPLATE_PAYLOAD} design={preview} />
                </div>
                <span className="mt-2 block px-1 text-xs font-medium">{t.name}</span>
              </button>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="pattern" className="space-y-6">
        <OptionGrid
          label="Forme des modules"
          options={DOT_STYLES}
          value={design.dots.style}
          onChange={(style) => set("dots", { style })}
          render={(v) => <DotGlyph style={v} />}
        />
        <OptionGrid
          label="Contour des repères"
          options={CORNER_SQUARE_STYLES}
          value={design.cornersSquare.style}
          onChange={(style) => set("cornersSquare", { style })}
          render={(v) => <CornerGlyph style={v} />}
        />
        <OptionGrid
          label="Centre des repères"
          options={CORNER_DOT_STYLES}
          value={design.cornersDot.style}
          onChange={(style) => set("cornersDot", { style })}
          render={(v) => <CornerDotGlyph style={v} />}
        />
      </TabsContent>

      <TabsContent value="colors" className="space-y-5">
        <ColorField
          label="Couleur du motif"
          value={design.dots.color}
          onChange={(color) =>
            onChange({
              ...design,
              dots: { ...design.dots, color },
              // Les repères suivent le motif tant qu'ils avaient la même couleur.
              cornersSquare: design.cornersSquare.color === design.dots.color ? { ...design.cornersSquare, color } : design.cornersSquare,
              cornersDot: design.cornersDot.color === design.dots.color ? { ...design.cornersDot, color } : design.cornersDot,
            })
          }
        />
        <div className="space-y-3 rounded-xl border p-4">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">Dégradé</span>
              <span className="text-xs text-muted-foreground">Transition de couleur sur le motif</span>
            </span>
            <Switch
              checked={Boolean(design.dots.gradient)}
              onCheckedChange={(on) =>
                set("dots", { gradient: on ? { type: "linear", to: "#a855f7", rotation: 45 } : null })
              }
            />
          </label>
          {design.dots.gradient && (
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <ColorField
                label="Seconde couleur"
                value={design.dots.gradient.to}
                onChange={(to) => set("dots", { gradient: { ...design.dots.gradient!, to } })}
                swatches={[]}
              />
              <div className="space-y-2">
                <span className="text-sm font-medium">Type</span>
                <div className="flex gap-2">
                  {(["linear", "radial"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      size="sm"
                      variant={design.dots.gradient?.type === type ? "default" : "outline"}
                      onClick={() => set("dots", { gradient: { ...design.dots.gradient!, type } })}
                    >
                      {type === "linear" ? "Linéaire" : "Radial"}
                    </Button>
                  ))}
                </div>
              </div>
              {design.dots.gradient.type === "linear" && (
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Angle</span>
                    <span className="text-muted-foreground tabular-nums">{design.dots.gradient.rotation}°</span>
                  </div>
                  <Slider
                    value={[design.dots.gradient.rotation]}
                    min={0}
                    max={360}
                    step={15}
                    onValueChange={([rotation]) => set("dots", { gradient: { ...design.dots.gradient!, rotation } })}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField label="Contour des repères" value={design.cornersSquare.color} onChange={(color) => set("cornersSquare", { color })} swatches={[]} />
          <ColorField label="Centre des repères" value={design.cornersDot.color} onChange={(color) => set("cornersDot", { color })} swatches={[]} />
        </div>
        <ColorField
          label="Arrière-plan"
          value={design.background.color}
          onChange={(color) => set("background", { color })}
          swatches={["#ffffff", "#fafafa", "#f5f3ff", "#fdf2f8", "#f0fdf4", "#eff6ff", "#fffbeb", "#18181b", "#09090b"]}
        />
      </TabsContent>

      <TabsContent value="logo">
        <LogoTab design={design} set={set} />
      </TabsContent>

      <TabsContent value="frame" className="space-y-6">
        <OptionGrid
          label="Style du cadre"
          options={FRAME_STYLES}
          value={design.frame.style}
          onChange={(style) => set("frame", { style })}
          render={(v) => <FrameGlyph style={v} />}
        />
        {design.frame.style !== "none" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="frame-text">Appel à l&apos;action</Label>
              <Input
                id="frame-text"
                value={design.frame.text}
                maxLength={32}
                onChange={(e) => set("frame", { text: e.target.value.toUpperCase() })}
              />
              <div className="flex flex-wrap gap-1.5">
                {FRAME_TEXTS.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => set("frame", { text })}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                      design.frame.text === text && "border-primary bg-primary/10 text-primary",
                    )}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField label="Couleur du cadre" value={design.frame.color} onChange={(color) => set("frame", { color })} swatches={[]} />
              <ColorField label="Couleur du texte" value={design.frame.textColor} onChange={(textColor) => set("frame", { textColor })} swatches={[]} />
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-medium">Correction d&apos;erreur</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ERROR_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onChange({ ...design, errorCorrection: level.value })}
                className={cn(
                  "rounded-lg border p-2.5 text-left transition-colors hover:border-primary/40",
                  design.errorCorrection === level.value && "border-primary bg-primary/5 ring-1 ring-primary",
                )}
              >
                <span className="block text-sm font-medium">{level.label}</span>
                <span className="text-xs text-muted-foreground">{level.hint}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Un niveau élevé rend le QR code plus robuste (taches, logo) mais plus dense.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Marge</span>
            <span className="text-muted-foreground tabular-nums">{design.margin}</span>
          </div>
          <Slider value={[design.margin]} min={0} max={40} step={1} onValueChange={([margin]) => onChange({ ...design, margin })} />
        </div>
        <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <span>
            <span className="block text-sm font-medium">Fond transparent</span>
            <span className="text-xs text-muted-foreground">Pour l&apos;intégrer à vos visuels (PNG et SVG)</span>
          </span>
          <Switch checked={design.background.transparent} onCheckedChange={(transparent) => set("background", { transparent })} />
        </label>
      </TabsContent>
    </Tabs>
  )
}

function LogoTab({ design, set }: { design: QrDesign; set: <K extends keyof QrDesign>(key: K, patch: Partial<QrDesign[K]>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFile = async (file?: File) => {
    if (!file) return
    setLoading(true)
    try {
      set("logo", { src: await normalizeLogo(file) })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image illisible")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {design.logo.src ? (
        <div className="flex items-center gap-4 rounded-xl border p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.logo.src} alt="Logo" className="size-16 rounded-lg border bg-white object-contain p-1" />
          <div className="flex-1 text-sm">
            <p className="font-medium">Logo importé</p>
            <p className="text-xs text-muted-foreground">Centré automatiquement dans le QR code</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload /> Remplacer
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => set("logo", { src: null })} aria-label="Retirer le logo">
            <Trash2 />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files[0])
          }}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/40",
            dragging && "border-primary bg-primary/5",
          )}
        >
          <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <ImagePlus className="size-5" />
          </span>
          <span className="text-sm font-medium">{loading ? "Traitement…" : "Glissez votre logo ou cliquez pour importer"}</span>
          <span className="text-xs text-muted-foreground">PNG, JPG, WEBP ou SVG · 5 Mo max</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      {design.logo.src && (
        <>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Taille du logo</span>
              <span className="text-muted-foreground tabular-nums">{Math.round(design.logo.size * 100)} %</span>
            </div>
            <Slider value={[design.logo.size]} min={0.1} max={0.5} step={0.01} onValueChange={([size]) => set("logo", { size })} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Espacement</span>
              <span className="text-muted-foreground tabular-nums">{design.logo.margin} px</span>
            </div>
            <Slider value={[design.logo.margin]} min={0} max={20} step={1} onValueChange={([margin]) => set("logo", { margin })} />
          </div>
          <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <span>
              <span className="block text-sm font-medium">Dégager l&apos;arrière du logo</span>
              <span className="text-xs text-muted-foreground">Retire les modules sous le logo pour une meilleure lecture</span>
            </span>
            <Switch checked={design.logo.hideBackgroundDots} onCheckedChange={(hideBackgroundDots) => set("logo", { hideBackgroundDots })} />
          </label>
        </>
      )}
    </div>
  )
}

function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  render: (value: T) => React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-2 text-[11px] text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground",
              value === opt.value && "border-primary bg-primary/5 text-foreground ring-1 ring-primary",
            )}
          >
            <span className="grid size-9 place-items-center text-foreground">{render(opt.value)}</span>
            <span className="line-clamp-1">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* Pictogrammes des styles ---------------------------------------------------- */

function DotGlyph({ style }: { style: string }) {
  const cells = [
    [0, 0], [1, 0], [0, 1], [2, 1], [1, 2], [2, 2],
  ]
  const shape = (x: number, y: number, i: number) => {
    const px = 2 + x * 10
    const py = 2 + y * 10
    switch (style) {
      case "dots":
        return <circle key={i} cx={px + 4.5} cy={py + 4.5} r={4.2} />
      case "rounded":
        return <rect key={i} x={px} y={py} width={9} height={9} rx={3} />
      case "extra-rounded":
        return <rect key={i} x={px} y={py} width={9} height={9} rx={4.5} />
      case "classy":
        return <path key={i} d={`M${px} ${py}h9v5a4 4 0 0 1-4 4h-5z`} />
      case "classy-rounded":
        return <path key={i} d={`M${px + 3} ${py}h6v6a3 3 0 0 1-3 3h-6v-6a3 3 0 0 1 3-3z`} />
      default:
        return <rect key={i} x={px} y={py} width={9} height={9} />
    }
  }
  return (
    <svg viewBox="0 0 32 32" className="size-8 fill-current">
      {cells.map(([x, y], i) => shape(x, y, i))}
    </svg>
  )
}

function CornerGlyph({ style }: { style: string }) {
  const rx = { square: 0, "extra-rounded": 7, dot: 13, classy: 0 }[style] ?? 0
  return (
    <svg viewBox="0 0 32 32" className="size-8 fill-none stroke-current" strokeWidth={4}>
      {style === "classy" ? (
        <path d="M4 4h24v16a8 8 0 0 1-8 8H4z" />
      ) : (
        <rect x={4} y={4} width={24} height={24} rx={rx} />
      )}
    </svg>
  )
}

function CornerDotGlyph({ style }: { style: string }) {
  return (
    <svg viewBox="0 0 32 32" className="size-8 fill-current">
      <rect x={3} y={3} width={26} height={26} rx={6} className="fill-none stroke-current opacity-25" strokeWidth={2} />
      {style === "dot" ? (
        <circle cx={16} cy={16} r={7} />
      ) : style === "rounded" ? (
        <rect x={9} y={9} width={14} height={14} rx={4} />
      ) : style === "classy" ? (
        <path d="M9 9h14v8a6 6 0 0 1-6 6H9z" />
      ) : (
        <rect x={9} y={9} width={14} height={14} />
      )}
    </svg>
  )
}

function FrameGlyph({ style }: { style: string }) {
  return (
    <svg viewBox="0 0 32 32" className="size-8">
      {style === "none" && <rect x={7} y={7} width={18} height={18} rx={2} className="fill-current opacity-80" />}
      {style === "bottom" && (
        <>
          <rect x={5} y={2} width={22} height={28} rx={4} className="fill-current" />
          <rect x={8} y={5} width={16} height={16} rx={1.5} className="fill-background" />
          <rect x={11} y={24} width={10} height={2.5} rx={1} className="fill-background" />
        </>
      )}
      {style === "top" && (
        <>
          <rect x={5} y={2} width={22} height={28} rx={4} className="fill-current" />
          <rect x={8} y={11} width={16} height={16} rx={1.5} className="fill-background" />
          <rect x={11} y={5.5} width={10} height={2.5} rx={1} className="fill-background" />
        </>
      )}
      {style === "pill" && (
        <>
          <rect x={5} y={3} width={22} height={22} rx={5} className="fill-none stroke-current" strokeWidth={2} />
          <rect x={9} y={7} width={14} height={14} rx={1.5} className="fill-current opacity-70" />
          <rect x={8} y={22} width={16} height={7} rx={3.5} className="fill-current" />
        </>
      )}
    </svg>
  )
}

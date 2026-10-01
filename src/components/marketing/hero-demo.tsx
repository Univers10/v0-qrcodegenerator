"use client"

import { BarChart3, Globe, MapPin, Smartphone } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useMemo, useState } from "react"

import { QrImage } from "@/components/qr/qr-image"
import { Input } from "@/components/ui/input"
import { normalizeUrl } from "@/lib/qr/content"
import { applyTemplate, DEFAULT_DESIGN, DESIGN_TEMPLATES, type QrDesign } from "@/lib/qr/design"
import { cn } from "@/lib/utils"

const PRESETS = ["indigo", "sunset", "ocean", "noir"].map((id) => DESIGN_TEMPLATES.find((t) => t.id === id)!)

export function HeroDemo() {
  const reduce = useReducedMotion()
  const [url, setUrl] = useState("univers10.com")
  const [preset, setPreset] = useState(PRESETS[0].id)
  const [framed, setFramed] = useState(true)

  const design = useMemo<QrDesign>(() => {
    const base = applyTemplate(DEFAULT_DESIGN, PRESETS.find((p) => p.id === preset)!.design)
    const dark = preset === "noir"
    return {
      ...base,
      errorCorrection: "Q",
      frame: {
        style: framed ? "bottom" : "none",
        text: "SCANNEZ-MOI",
        color: dark ? "#09090b" : base.cornersSquare.color,
        textColor: "#ffffff",
      },
    }
  }, [preset, framed])

  const payload = normalizeUrl(url) || "https://qrcreator.app"

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_28%,transparent),transparent)] blur-2xl" />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="rounded-3xl border bg-card/80 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">Essayez : modifiez l&apos;adresse</span>
        </div>

        <div className="relative">
          <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-11 rounded-xl pl-9 text-sm"
            aria-label="Adresse à encoder"
            placeholder="votre-site.fr"
          />
        </div>

        <div className="relative mx-auto mt-5 w-[78%]">
          <QrImage payload={payload} design={design} debounce={150} alt="QR code de démonstration" />
          {!reduce && (
            <div className="pointer-events-none absolute inset-x-[8%] top-0 h-[78%] overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 animate-scan bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_2px] shadow-primary/50" />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-2" role="radiogroup" aria-label="Style">
            {PRESETS.map((p) => {
              const d = applyTemplate(DEFAULT_DESIGN, p.design)
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={preset === p.id}
                  aria-label={p.name}
                  onClick={() => setPreset(p.id)}
                  className={cn(
                    "size-8 rounded-full border-2 border-background shadow-md ring-offset-2 ring-offset-card transition-transform hover:scale-110",
                    preset === p.id && "ring-2 ring-primary",
                  )}
                  style={{
                    background: d.dots.gradient
                      ? `linear-gradient(135deg, ${d.dots.color}, ${d.dots.gradient.to})`
                      : d.dots.color === "#fafafa"
                        ? "#09090b"
                        : d.dots.color,
                  }}
                />
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setFramed((f) => !f)}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            {framed ? "Retirer le cadre" : "Ajouter un cadre"}
          </button>
        </div>
      </motion.div>

      <FloatingCard className="-left-16 top-24 hidden xl:flex" delay={0.5}>
        <span className="grid size-8 place-items-center rounded-lg bg-success/15 text-success">
          <Smartphone className="size-4" />
        </span>
        <span>
          <span className="block text-xs font-medium">Nouveau scan</span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> Lyon · iPhone · à l&apos;instant
          </span>
        </span>
      </FloatingCard>

      <FloatingCard className="-right-12 bottom-28 hidden xl:flex" delay={0.7}>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
          <BarChart3 className="size-4" />
        </span>
        <span>
          <span className="block text-xs font-medium">Scans cette semaine</span>
          <svg viewBox="0 0 80 20" className="mt-1 h-4 w-20 text-primary" aria-hidden="true">
            <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,16 12,13 24,14 36,9 48,10 60,5 72,6 80,2" />
          </svg>
        </span>
      </FloatingCard>
    </div>
  )
}

function FloatingCard({ children, className, delay }: { children: React.ReactNode; className?: string; delay: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={cn("absolute z-10 animate-float items-center gap-2.5 rounded-2xl border bg-card/90 p-3 pr-4 shadow-xl backdrop-blur-xl", className)}
    >
      {children}
    </motion.div>
  )
}

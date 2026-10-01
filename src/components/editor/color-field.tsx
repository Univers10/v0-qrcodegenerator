"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const SWATCHES = ["#18181b", "#4f46e5", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#16a34a", "#0891b2", "#ffffff"]

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  swatches?: string[]
  className?: string
}

export function ColorField({ label, value, onChange, swatches = SWATCHES, className }: Props) {
  const [draft, setDraft] = useState(value)
  // Resynchronise la saisie quand la couleur change de l'extérieur (ajustement pendant le rendu).
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setDraft(value)
  }

  const commit = (v: string) => {
    const hex = v.startsWith("#") ? v : `#${v}`
    if (/^#[\da-f]{6}$/i.test(hex)) onChange(hex.toLowerCase())
    else setDraft(value)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <label
          className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-xs ring-offset-2 focus-within:ring-2 focus-within:ring-ring"
          style={{ background: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
          className="h-9 w-28 font-mono text-xs uppercase"
          maxLength={7}
          aria-label={`${label} (hexadécimal)`}
        />
        <div className="hidden flex-wrap gap-1 sm:flex">
          {swatches.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={cn(
                "size-5 rounded-full border shadow-xs transition-transform hover:scale-110",
                s.toLowerCase() === value.toLowerCase() && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
              style={{ background: s }}
              aria-label={`Couleur ${s}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

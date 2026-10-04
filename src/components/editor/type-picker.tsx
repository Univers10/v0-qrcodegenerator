"use client"

import type { QrType } from "@/lib/qr/content"
import { TYPE_META, TYPE_ORDER } from "@/lib/qr/meta"
import { cn } from "@/lib/utils"

export function TypePicker({ value, onChange, disabled }: { value: QrType; onChange: (t: QrType) => void; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Type de QR code" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      {TYPE_ORDER.map((type) => {
        const meta = TYPE_META[type]
        const Icon = meta.icon
        const active = value === type
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled && !active}
            onClick={() => onChange(type)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-all",
              "hover:border-primary/40 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40",
              active && "border-primary bg-primary/[0.04] ring-1 ring-primary",
            )}
          >
            <span
              className="grid size-8 place-items-center rounded-lg transition-transform group-hover:scale-105"
              style={{ background: `color-mix(in oklch, ${meta.accent} 14%, transparent)`, color: meta.accent }}
            >
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium leading-tight">{meta.label}</span>
              <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{meta.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

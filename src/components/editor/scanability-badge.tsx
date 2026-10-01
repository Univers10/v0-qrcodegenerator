"use client"

import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { scanability, type QrDesign } from "@/lib/qr/design"
import { cn } from "@/lib/utils"

const LEVELS = {
  excellent: { label: "Lisibilité excellente", icon: CircleCheck, className: "text-success bg-success/10 border-success/25" },
  good: { label: "Lisibilité correcte", icon: TriangleAlert, className: "text-warning bg-warning/10 border-warning/30" },
  risky: { label: "Lisibilité à risque", icon: CircleAlert, className: "text-destructive bg-destructive/10 border-destructive/25" },
}

export function ScanabilityBadge({ design }: { design: QrDesign }) {
  const { level, score, issues } = scanability(design)
  const meta = LEVELS[level]
  const Icon = meta.icon
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", meta.className)}
        >
          <Icon className="size-3.5" />
          {meta.label}
          <span className="tabular-nums opacity-70">· {score}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm" align="center">
        <p className="font-medium">Analyse de lisibilité</p>
        {issues.length === 0 ? (
          <p className="mt-1 text-muted-foreground">
            Contraste, marge et correction d&apos;erreur sont optimaux. Votre QR code sera lu par tous les appareils.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            {issues.map((issue) => (
              <li key={issue} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                {issue}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Testez toujours votre QR code avant de l&apos;imprimer.</p>
      </PopoverContent>
    </Popover>
  )
}

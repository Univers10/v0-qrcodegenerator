"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyButton({ value, label = "Copier", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("gap-2", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? "Copié !" : label}
    </Button>
  )
}

export function RevealSecret({ value }: { value: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      className="w-full rounded-lg bg-muted px-3 py-2.5 text-left font-mono text-sm break-all"
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    >
      {visible ? value : "•".repeat(Math.min(16, Math.max(8, value.length)))}
      <span className="float-right font-sans text-xs text-muted-foreground">{visible ? "Masquer" : "Afficher"}</span>
    </button>
  )
}

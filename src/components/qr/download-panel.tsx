"use client"

import { Check, ClipboardCopy, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { copyQrToClipboard, downloadBlob, exportQr, type ExportFormat } from "@/lib/qr/render"
import { cn, slugify } from "@/lib/utils"

const FORMATS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: "png", label: "PNG", hint: "Web & réseaux" },
  { value: "svg", label: "SVG", hint: "Vectoriel" },
  { value: "pdf", label: "PDF", hint: "Impression" },
  { value: "jpeg", label: "JPG", hint: "Universel" },
]

const SIZES = [512, 1024, 2048, 4096]

type Props = {
  getSvg: () => string | null
  name: string
  disabled?: boolean
  disabledReason?: string
  className?: string
}

export function DownloadPanel({ getSvg, name, disabled, disabledReason, className }: Props) {
  const [format, setFormat] = useState<ExportFormat>("png")
  const [size, setSize] = useState(1024)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const download = async () => {
    const svg = getSvg()
    if (!svg) return
    setBusy(true)
    try {
      const blob = await exportQr(svg, format, size)
      downloadBlob(blob, `${slugify(name)}.${format === "jpeg" ? "jpg" : format}`)
      toast.success(`QR code téléchargé en ${format.toUpperCase()}`)
    } catch {
      toast.error("Le téléchargement a échoué")
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    const svg = getSvg()
    if (!svg) return
    try {
      await copyQrToClipboard(svg)
      setCopied(true)
      toast.success("Image copiée dans le presse-papiers")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Copie non prise en charge par ce navigateur")
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Format">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={format === f.value}
            onClick={() => setFormat(f.value)}
            className={cn(
              "min-w-0 rounded-lg border px-1 py-2 text-center transition-colors hover:border-primary/40",
              format === f.value && "border-primary bg-primary/5 ring-1 ring-primary",
            )}
          >
            <span className="block text-sm font-semibold">{f.label}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{f.hint}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {format !== "svg" && (
          <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
            <SelectTrigger className="w-28 shrink-0" aria-label="Taille">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button type="button" className="min-w-0 flex-1" onClick={download} disabled={disabled || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Download />}
          Télécharger
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={copy} disabled={disabled} aria-label="Copier l'image">
          {copied ? <Check /> : <ClipboardCopy />}
        </Button>
      </div>
      {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
    </div>
  )
}

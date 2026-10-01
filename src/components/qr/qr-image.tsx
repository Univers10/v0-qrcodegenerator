"use client"

import { useEffect, useState } from "react"

import type { QrDesign } from "@/lib/qr/design"
import { renderQrSvg } from "@/lib/qr/render"
import { cn } from "@/lib/utils"

type Props = {
  payload: string
  design: QrDesign
  className?: string
  alt?: string
  /** Délai avant rendu, pour lisser les modifications successives dans l'éditeur. */
  debounce?: number
  onRender?: (svg: string) => void
}

/**
 * Affiche un QR code stylé. Le SVG est rendu dans une <img> (via une URL blob)
 * pour isoler ses identifiants internes (dégradés, masques) du reste de la page.
 */
export function QrImage({ payload, design, className, alt = "QR code", debounce = 0, onRender }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    let url: string | null = null
    const timer = setTimeout(async () => {
      try {
        const svg = await renderQrSvg(payload, design)
        if (cancelled) return
        url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
        setSrc(url)
        setError(false)
        onRender?.(svg)
      } catch {
        if (!cancelled) setError(true)
      }
    }, debounce)
    return () => {
      cancelled = true
      clearTimeout(timer)
      // L'ancienne URL est libérée après le remplacement de l'image pour éviter un flash.
      if (url) setTimeout(() => URL.revokeObjectURL(url!), 2000)
    }
    // onRender est volontairement exclu : seul le contenu visuel déclenche un rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, design, debounce])

  if (error) {
    return (
      <div className={cn("grid aspect-square place-items-center rounded-lg bg-muted text-center text-xs text-muted-foreground", className)}>
        Contenu trop long pour un QR code
      </div>
    )
  }

  if (!src) return <div className={cn("aspect-square animate-pulse rounded-lg bg-muted", className)} />

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className={cn("block h-auto w-full select-none", className)} />
}

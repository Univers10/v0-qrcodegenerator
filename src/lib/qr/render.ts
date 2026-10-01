"use client"

import type { Options } from "qr-code-styling"

import type { QrDesign } from "./design"

/** Taille interne de rendu du QR (unité de travail du SVG final). */
const BASE = 1000

type QRCodeStylingCtor = typeof import("qr-code-styling").default
let ctorPromise: Promise<QRCodeStylingCtor> | null = null

// qr-code-styling dépend du DOM : on le charge uniquement côté navigateur.
function loadLibrary() {
  ctorPromise ??= import("qr-code-styling").then((m) => m.default)
  return ctorPromise
}

function toOptions(payload: string, design: QrDesign): Options {
  const gradient = design.dots.gradient
  return {
    type: "svg",
    width: BASE,
    height: BASE,
    margin: design.frame.style === "none" ? Math.round((design.margin / 100) * BASE * 0.6) : Math.round(BASE * 0.03),
    data: payload,
    image: design.logo.src ?? undefined,
    qrOptions: { errorCorrectionLevel: design.logo.src && design.errorCorrection === "L" ? "M" : design.errorCorrection },
    imageOptions: {
      hideBackgroundDots: design.logo.hideBackgroundDots,
      imageSize: design.logo.size,
      margin: design.logo.margin,
      crossOrigin: "anonymous",
      saveAsBlob: true,
    },
    dotsOptions: {
      type: design.dots.style,
      color: design.dots.color,
      roundSize: true,
      gradient: gradient
        ? {
            type: gradient.type,
            rotation: (gradient.rotation * Math.PI) / 180,
            colorStops: [
              { offset: 0, color: design.dots.color },
              { offset: 1, color: gradient.to },
            ],
          }
        : undefined,
    },
    cornersSquareOptions: { type: design.cornersSquare.style, color: design.cornersSquare.color },
    cornersDotOptions: { type: design.cornersDot.style, color: design.cornersDot.color },
    backgroundOptions: { color: design.background.transparent ? "transparent" : design.background.color },
  }
}

const escapeXml = (v: string) =>
  v.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!)

/** Transforme le SVG racine en SVG imbriqué positionné. */
function nest(svg: string, x: number, y: number, size: number) {
  const body = svg.replace(/<\?xml[^>]*\?>/, "").trim()
  return body.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    const clean = attrs.replace(/\s(width|height|x|y|viewBox)="[^"]*"/g, "")
    return `<svg${clean} x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 ${BASE} ${BASE}">`
  })
}

function composeFrame(qrSvg: string, design: QrDesign) {
  const { frame } = design
  const S = BASE
  const ns = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
  const font = 'font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-weight="800"'
  const text = escapeXml(frame.text.trim() || "SCANNEZ-MOI")

  if (frame.style === "none") {
    return `<svg ${ns} width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${nest(qrSvg, 0, 0, S)}</svg>`
  }

  const pad = S * 0.07
  const band = S * 0.2
  const inner = S * 0.045
  const bg = design.background.transparent ? "#ffffff" : design.background.color
  const fontSize = Math.min(band * 0.42, (S * 1.5) / Math.max(text.length, 6))

  if (frame.style === "pill") {
    const W = S + pad * 2
    const H = S + pad * 2 + band * 0.55
    const pillW = Math.min(W * 0.86, text.length * fontSize * 0.68 + S * 0.16)
    const pillH = band * 0.62
    const pillY = S + pad * 2 - pillH / 2 - S * 0.01
    return `<svg ${ns} width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="${S * 0.0125}" y="${S * 0.0125}" width="${W - S * 0.025}" height="${S + pad * 2 - S * 0.025}" rx="${S * 0.08}" fill="${bg}" stroke="${frame.color}" stroke-width="${S * 0.025}"/>
  ${nest(qrSvg, pad, pad, S)}
  <rect x="${(W - pillW) / 2}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${frame.color}"/>
  <text x="${W / 2}" y="${pillY + pillH / 2}" dominant-baseline="central" text-anchor="middle" ${font} font-size="${fontSize}" letter-spacing="${fontSize * 0.06}" fill="${frame.textColor}">${text}</text>
</svg>`
  }

  const W = S + pad * 2
  const H = S + pad * 2 + band
  const top = frame.style === "top"
  const qrY = top ? band + pad : pad
  const textY = top ? (band + pad) / 2 + pad * 0.25 : S + pad + (band + pad) / 2 - pad * 0.25
  return `<svg ${ns} width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><clipPath id="qrc-inner"><rect x="${pad}" y="${qrY}" width="${S}" height="${S}" rx="${inner}"/></clipPath></defs>
  <rect width="${W}" height="${H}" rx="${S * 0.09}" fill="${frame.color}"/>
  <rect x="${pad}" y="${qrY}" width="${S}" height="${S}" rx="${inner}" fill="${bg}"/>
  <g clip-path="url(#qrc-inner)">${nest(qrSvg, pad, qrY, S)}</g>
  <text x="${W / 2}" y="${textY}" dominant-baseline="central" text-anchor="middle" ${font} font-size="${fontSize}" letter-spacing="${fontSize * 0.08}" fill="${frame.textColor}">${text}</text>
</svg>`
}

/** Génère le SVG final (QR + cadre) sous forme de chaîne autonome. */
export async function renderQrSvg(payload: string, design: QrDesign): Promise<string> {
  const QRCodeStyling = await loadLibrary()
  const qr = new QRCodeStyling(toOptions(payload || " ", design))
  const raw = await qr.getRawData("svg")
  if (!raw) throw new Error("Échec de génération du QR code")
  const svg = typeof (raw as Blob).text === "function" ? await (raw as Blob).text() : String(raw)
  return composeFrame(svg, design)
}

export type ExportFormat = "png" | "jpeg" | "svg" | "pdf"

function svgSize(svg: string) {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
  return m ? { w: Number(m[1]), h: Number(m[2]) } : { w: BASE, h: BASE }
}

async function rasterize(svg: string, width: number, mime: "image/png" | "image/jpeg", background?: string) {
  const { w, h } = svgSize(svg)
  const height = Math.round((width * h) / w)
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }))
  try {
    const img = new Image()
    img.decoding = "async"
    img.src = url
    await img.decode()
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    if (background) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, width, height)
    }
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export impossible"))), mime, 0.95),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function exportQr(svg: string, format: ExportFormat, width: number): Promise<Blob> {
  if (format === "svg") return new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  if (format === "png") return rasterize(svg, width, "image/png")
  if (format === "jpeg") return rasterize(svg, width, "image/jpeg", "#ffffff")

  const png = await rasterize(svg, Math.max(width, 1200), "image/png")
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(png)
  })
  const { jsPDF } = await import("jspdf")
  // Page A4 avec le QR centré, 12 cm de large (format d'impression courant).
  const pdf = new jsPDF({ unit: "mm", format: "a4" })
  const { w, h } = svgSize(svg)
  const printW = 120
  const printH = (printW * h) / w
  pdf.addImage(dataUrl, "PNG", (210 - printW) / 2, (297 - printH) / 2, printW, printH)
  return pdf.output("blob")
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyQrToClipboard(svg: string) {
  const blob = await rasterize(svg, 1024, "image/png")
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
}


/** Redimensionne un logo importé en PNG carré compact (≤ 512 px). */
export async function normalizeLogo(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("Fichier trop volumineux (5 Mo maximum)")
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) throw new Error("Formats acceptés : PNG, JPG, WEBP, SVG")
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const max = 512
    const ratio = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max))
    const w = Math.max(1, Math.round((img.naturalWidth || max) * ratio))
    const h = Math.max(1, Math.round((img.naturalHeight || max) * ratio))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
    const png = canvas.toDataURL("image/png")
    // Les photos très détaillées dépassent vite la limite : WEBP conserve la transparence.
    return png.length > 380_000 ? canvas.toDataURL("image/webp", 0.88) : png
  } finally {
    URL.revokeObjectURL(url)
  }
}

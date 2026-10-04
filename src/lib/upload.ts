"use client"

export type ImageKind = "cover" | "logo" | "item"

const PRESETS: Record<ImageKind, { max: number; quality: number; square: boolean }> = {
  cover: { max: 1600, quality: 0.8, square: false },
  logo: { max: 400, quality: 0.9, square: true },
  item: { max: 720, quality: 0.8, square: false },
}

/**
 * Redimensionne et recompresse l'image côté navigateur avant l'envoi
 * (WEBP, quelques dizaines de Ko) : pages de menu légères, même en 3G.
 */
async function compress(file: File, kind: ImageKind): Promise<Blob> {
  if (!/^image\/(png|jpeg|webp|gif|avif|heic|heif)$/.test(file.type) && !file.type.startsWith("image/"))
    throw new Error("Choisissez une image (JPG, PNG ou WEBP)")
  if (file.size > 20 * 1024 * 1024) throw new Error("Image trop volumineuse (20 Mo maximum)")

  const { max, quality, square } = PRESETS[kind]
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Format d'image non pris en charge par ce navigateur")
  })
  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height
  if (square) {
    const side = Math.min(sw, sh)
    sx = (sw - side) / 2
    sy = (sh - side) / 2
    sw = sh = side
  }
  const ratio = Math.min(1, max / Math.max(sw, sh))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(sw * ratio)
  canvas.height = Math.round(sh * ratio)
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  for (const q of [quality, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", q))
    // Certains navigateurs anciens ignorent WEBP et renvoient du PNG : on retombe sur JPEG.
    const out = blob && blob.type === "image/webp" ? blob : await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q))
    if (out && out.size <= 780 * 1024) return out
  }
  throw new Error("Image trop détaillée, essayez une photo plus légère")
}

export async function uploadImage(file: File, kind: ImageKind): Promise<string> {
  const blob = await compress(file, kind)
  const body = new FormData()
  body.append("file", blob, `${kind}.${blob.type === "image/webp" ? "webp" : "jpg"}`)
  const response = await fetch("/api/assets", { method: "POST", body })
  const json = (await response.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!response.ok || !json.url) throw new Error(json.error ?? "Échec de l'envoi de l'image")
  return json.url
}

import "server-only"

import { randomUUID } from "node:crypto"
import { and, count, eq, lt, notInArray, sum } from "drizzle-orm"

import { db } from "@/lib/db"
import { asset, qrCode } from "@/lib/db/schema"

export const MAX_ASSET_BYTES = 800 * 1024
const MAX_ASSETS_PER_USER = 600
const MAX_BYTES_PER_USER = 80 * 1024 * 1024

/** Détermine le format réel à partir de la signature binaire (le type MIME envoyé n'est pas fiable). */
export function sniffImage(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png"
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg"
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to))
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp"
  return null
}

export type CreateAssetResult = { ok: true; id: string; url: string } | { ok: false; error: string; status: number }

export async function createAsset(userId: string, bytes: Uint8Array): Promise<CreateAssetResult> {
  if (bytes.length > MAX_ASSET_BYTES) return { ok: false, error: "Image trop volumineuse (800 Ko maximum)", status: 413 }
  const mime = sniffImage(bytes)
  // SVG volontairement refusé : servi depuis notre domaine, il pourrait exécuter du script.
  if (!mime) return { ok: false, error: "Formats acceptés : PNG, JPG ou WEBP", status: 415 }

  const [usage] = await db
    .select({ files: count(), bytes: sum(asset.size) })
    .from(asset)
    .where(eq(asset.userId, userId))
  if ((usage?.files ?? 0) >= MAX_ASSETS_PER_USER || Number(usage?.bytes ?? 0) + bytes.length > MAX_BYTES_PER_USER)
    return { ok: false, error: "Espace de stockage des images plein : supprimez des photos inutilisées", status: 507 }

  const id = randomUUID()
  await db.insert(asset).values({ id, userId, mime, size: bytes.length, data: Buffer.from(bytes) })
  return { ok: true, id, url: `/api/assets/${id}` }
}

export async function getAsset(id: string) {
  return db.query.asset.findFirst({ where: eq(asset.id, id), columns: { mime: true, data: true } })
}

const ASSET_REF = /\/api\/assets\/([\w-]{8,64})/g

/**
 * Supprime les images de l'utilisateur qui ne sont plus référencées par aucun de ses QR codes.
 * Les fichiers récents (< 1 h) sont conservés : ils peuvent appartenir à une édition en cours.
 */
export async function collectOrphanAssets(userId: string) {
  const codes = await db.select({ data: qrCode.data }).from(qrCode).where(eq(qrCode.userId, userId))
  const referenced = new Set<string>()
  for (const { data } of codes) for (const m of JSON.stringify(data).matchAll(ASSET_REF)) referenced.add(m[1])

  const cutoff = new Date(Date.now() - 60 * 60 * 1000)
  const keep = [...referenced]
  await db
    .delete(asset)
    .where(and(eq(asset.userId, userId), lt(asset.createdAt, cutoff), keep.length ? notInArray(asset.id, keep) : undefined))
}

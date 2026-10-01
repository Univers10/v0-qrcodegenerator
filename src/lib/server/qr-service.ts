import "server-only"

import { randomBytes, randomUUID } from "node:crypto"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { qrCode, type QrCodeRow } from "@/lib/db/schema"
import { encodeContent, fitsInQr, isQrType, parseContent, type QrContent, type QrType } from "@/lib/qr/content"
import { designSchema, parseDesign, type QrDesign } from "@/lib/qr/design"

export type QrCodeRecord = Omit<QrCodeRow, "data" | "design" | "type"> & {
  type: QrType
  data: QrContent
  design: QrDesign
}

function hydrate(row: QrCodeRow): QrCodeRecord {
  return { ...row, type: row.type as QrType, data: row.data as QrContent, design: parseDesign(row.design) }
}

export const qrInputSchema = z.object({
  name: z.string().trim().min(1, "Donnez un nom à votre QR code").max(80),
  type: z.string().refine(isQrType, "Type inconnu"),
  data: z.record(z.string(), z.unknown()),
  design: designSchema,
  isDynamic: z.boolean(),
})

export type QrInput = z.input<typeof qrInputSchema>

export type ValidationResult =
  | { ok: true; value: { name: string; type: QrType; data: QrContent; design: QrDesign; isDynamic: boolean } }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export function validateQrInput(input: unknown): ValidationResult {
  const parsed = qrInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  const type = parsed.data.type as QrType
  const content = parseContent(type, parsed.data.data)
  if (!content.success) return { ok: false, error: "Contenu invalide", fieldErrors: content.errors }
  // Un QR statique encode tout son contenu : il doit tenir dans la capacité du symbole.
  const level = parsed.data.design.logo.src && parsed.data.design.errorCorrection === "L" ? "M" : parsed.data.design.errorCorrection
  if (!parsed.data.isDynamic && !fitsInQr(encodeContent(type, content.data), level))
    return { ok: false, error: "Contenu trop long pour un QR statique : passez en dynamique ou baissez le niveau de correction." }
  return { ok: true, value: { ...parsed.data, type, data: content.data } }
}

// Alphabet sans caractères ambigus (0/O, 1/l/I)
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"

function randomShortCode(length = 7) {
  const bytes = randomBytes(length)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")
}

async function uniqueShortCode() {
  for (let i = 0; i < 6; i++) {
    const candidate = randomShortCode()
    const existing = await db.query.qrCode.findFirst({ where: eq(qrCode.shortCode, candidate), columns: { id: true } })
    if (!existing) return candidate
  }
  return randomShortCode(10)
}

export async function listQrCodes(userId: string) {
  const rows = await db.query.qrCode.findMany({
    where: eq(qrCode.userId, userId),
    orderBy: desc(qrCode.createdAt),
  })
  return rows.map(hydrate)
}

export async function getQrCode(userId: string, id: string) {
  const row = await db.query.qrCode.findFirst({ where: and(eq(qrCode.id, id), eq(qrCode.userId, userId)) })
  return row ? hydrate(row) : null
}

export async function getQrCodeByShortCode(shortCode: string) {
  const row = await db.query.qrCode.findFirst({ where: eq(qrCode.shortCode, shortCode) })
  return row ? hydrate(row) : null
}

export async function createQrCode(userId: string, value: Extract<ValidationResult, { ok: true }>["value"]) {
  const [row] = await db
    .insert(qrCode)
    .values({ id: randomUUID(), userId, shortCode: await uniqueShortCode(), ...value })
    .returning()
  return hydrate(row)
}

export async function updateQrCode(userId: string, id: string, value: Extract<ValidationResult, { ok: true }>["value"]) {
  const [row] = await db
    .update(qrCode)
    .set({ ...value, updatedAt: new Date() })
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, userId)))
    .returning()
  return row ? hydrate(row) : null
}

export async function deleteQrCode(userId: string, id: string) {
  const result = await db.delete(qrCode).where(and(eq(qrCode.id, id), eq(qrCode.userId, userId))).returning({ id: qrCode.id })
  return result.length > 0
}

export async function duplicateQrCode(userId: string, id: string) {
  const source = await getQrCode(userId, id)
  if (!source) return null
  return createQrCode(userId, {
    name: `${source.name} (copie)`.slice(0, 80),
    type: source.type,
    data: source.data,
    design: source.design,
    isDynamic: source.isDynamic,
  })
}

export async function setQrStatus(userId: string, id: string, status: "active" | "paused") {
  const result = await db
    .update(qrCode)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, userId)))
    .returning({ id: qrCode.id })
  return result.length > 0
}

export async function incrementScanCount(id: string, at: Date) {
  await db
    .update(qrCode)
    .set({ scanCount: sql`${qrCode.scanCount} + 1`, lastScannedAt: at })
    .where(eq(qrCode.id, id))
}

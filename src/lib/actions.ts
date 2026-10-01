"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth, getSession } from "@/lib/auth"
import {
  createQrCode,
  deleteQrCode,
  duplicateQrCode,
  setQrStatus,
  updateQrCode,
  validateQrInput,
} from "@/lib/server/qr-service"

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

async function userId() {
  const session = await getSession()
  return session?.user.id ?? null
}

const UNAUTHORIZED = { ok: false as const, error: "Votre session a expiré, reconnectez-vous." }

function refresh(id?: string) {
  revalidatePath("/dashboard", "layout")
  if (id) revalidatePath(`/dashboard/codes/${id}`)
}

export async function createQrAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const uid = await userId()
  if (!uid) return UNAUTHORIZED
  const parsed = validateQrInput(input)
  if (!parsed.ok) return parsed
  const created = await createQrCode(uid, parsed.value)
  refresh()
  return { ok: true, data: { id: created.id } }
}

export async function updateQrAction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const uid = await userId()
  if (!uid) return UNAUTHORIZED
  const parsed = validateQrInput(input)
  if (!parsed.ok) return parsed
  const updated = await updateQrCode(uid, id, parsed.value)
  if (!updated) return { ok: false, error: "QR code introuvable" }
  refresh(id)
  return { ok: true, data: { id } }
}

export async function deleteQrAction(id: string): Promise<ActionResult> {
  const uid = await userId()
  if (!uid) return UNAUTHORIZED
  const deleted = await deleteQrCode(uid, id)
  if (!deleted) return { ok: false, error: "QR code introuvable" }
  refresh()
  return { ok: true, data: undefined }
}

export async function duplicateQrAction(id: string): Promise<ActionResult<{ id: string }>> {
  const uid = await userId()
  if (!uid) return UNAUTHORIZED
  const copy = await duplicateQrCode(uid, id)
  if (!copy) return { ok: false, error: "QR code introuvable" }
  refresh()
  return { ok: true, data: { id: copy.id } }
}

export async function setQrStatusAction(id: string, status: "active" | "paused"): Promise<ActionResult> {
  const uid = await userId()
  if (!uid) return UNAUTHORIZED
  if (status !== "active" && status !== "paused") return { ok: false, error: "Statut invalide" }
  const done = await setQrStatus(uid, id, status)
  if (!done) return { ok: false, error: "QR code introuvable" }
  refresh(id)
  return { ok: true, data: undefined }
}

export async function updateProfileAction(name: string): Promise<ActionResult> {
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 60) return { ok: false, error: "Le nom doit contenir 2 à 60 caractères" }
  try {
    await auth.api.updateUser({ body: { name: trimmed }, headers: await headers() })
  } catch {
    return UNAUTHORIZED
  }
  revalidatePath("/dashboard", "layout")
  return { ok: true, data: undefined }
}

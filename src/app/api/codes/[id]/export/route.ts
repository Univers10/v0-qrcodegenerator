import { getSession } from "@/lib/auth"
import { getScansForExport, parseRange, RANGES, TIME_ZONE } from "@/lib/server/analytics"
import { getQrCode } from "@/lib/server/qr-service"
import { countryName, slugify } from "@/lib/utils"

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v)
  // Neutralise les formules (injection CSV) et échappe les guillemets.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",;\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return new Response("Non autorisé", { status: 401 })
  const { id } = await params
  const code = await getQrCode(session.user.id, id)
  if (!code) return new Response("Introuvable", { status: 404 })

  const range = parseRange(new URL(request.url).searchParams.get("range") ?? undefined)
  const since = new Date(Date.now() - RANGES[range].days * 86_400_000)
  const rows = await getScansForExport({ userId: session.user.id, qrCodeId: id }, since)

  const fmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, dateStyle: "short", timeStyle: "medium" })
  const header = ["Date", "QR code", "Appareil", "Système", "Navigateur", "Pays", "Ville", "Référent", "Visiteur (anonyme)"]
  const lines = rows.map((r) =>
    [fmt.format(r.date), r.qrName, r.device, r.os, r.browser, r.country ? countryName(r.country) : "", r.city, r.referer, r.visitor.slice(0, 12)]
      .map(csvCell)
      .join(";"),
  )
  // BOM UTF-8 + séparateur « ; » pour une ouverture directe dans Excel (paramètres régionaux FR).
  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n")
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="scans-${slugify(code.name)}-${range}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}

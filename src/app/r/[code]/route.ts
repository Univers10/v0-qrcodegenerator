import { after, type NextRequest } from "next/server"

import { redirectTarget } from "@/lib/qr/content"
import { getQrCodeByShortCode } from "@/lib/server/qr-service"
import { recordScan } from "@/lib/server/tracking"

export const dynamic = "force-dynamic"

const noStore = { "Cache-Control": "no-store, max-age=0" }

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const qr = await getQrCodeByShortCode(code)
  const landing = new URL(`/p/${encodeURIComponent(code)}`, request.url)

  if (!qr || qr.status === "paused") {
    return Response.redirect(landing, 302)
  }

  // Le scan est enregistré après l'envoi de la réponse : la redirection reste instantanée.
  const requestHeaders = new Headers(request.headers)
  after(() => recordScan(qr.id, requestHeaders).catch((error) => console.error("[scan]", error)))

  const target = redirectTarget(qr.type, qr.data)
  // 302 (et non 301) : la destination d'un QR dynamique peut changer à tout moment.
  return new Response(null, { status: 302, headers: { Location: target ?? landing.toString(), ...noStore } })
}

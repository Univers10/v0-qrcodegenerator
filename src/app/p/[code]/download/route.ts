import { buildEvent, buildVCard, type QrContent } from "@/lib/qr/content"
import { slugify } from "@/lib/utils"
import { getQrCodeByShortCode } from "@/lib/server/qr-service"

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const qr = await getQrCodeByShortCode(code)
  if (!qr || qr.status === "paused") return new Response("Introuvable", { status: 404 })

  if (qr.type === "vcard") {
    const c = qr.data as QrContent<"vcard">
    const name = slugify([c.firstName, c.lastName].filter(Boolean).join(" ") || c.organization)
    return new Response(buildVCard(c), {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}.vcf"`,
      },
    })
  }
  if (qr.type === "event") {
    const c = qr.data as QrContent<"event">
    return new Response(buildEvent(c, { calendar: true }), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slugify(c.title)}.ics"`,
      },
    })
  }
  return new Response("Aucun fichier pour ce type", { status: 400 })
}

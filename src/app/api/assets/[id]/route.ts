import { getAsset } from "@/lib/server/asset-service"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[\w-]{8,64}$/.test(id)) return new Response("Introuvable", { status: 404 })
  const file = await getAsset(id)
  if (!file) return new Response("Introuvable", { status: 404 })

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      // Une image n'est jamais modifiée (nouvel identifiant à chaque import) : cache CDN long.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  })
}

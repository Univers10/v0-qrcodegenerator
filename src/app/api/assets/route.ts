import { getSession } from "@/lib/auth"
import { createAsset, MAX_ASSET_BYTES } from "@/lib/server/asset-service"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Connexion requise" }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  if (!(file instanceof File)) return Response.json({ error: "Fichier manquant" }, { status: 400 })
  if (file.size > MAX_ASSET_BYTES) return Response.json({ error: "Image trop volumineuse (800 Ko maximum)" }, { status: 413 })

  const result = await createAsset(session.user.id, new Uint8Array(await file.arrayBuffer()))
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
  return Response.json({ id: result.id, url: result.url }, { status: 201 })
}

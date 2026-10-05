import { placeOrder } from "@/lib/server/order-service"

// Point d'entrée public : la page du menu y envoie le panier du client.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: "Requête invalide" }, { status: 400 })
  try {
    const result = await placeOrder(body, request.headers)
    if (!result.ok) return Response.json({ error: result.error, field: result.field }, { status: result.status })
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error("[order]", error)
    return Response.json({ error: "La commande n'a pas pu être enregistrée. Réessayez." }, { status: 500 })
  }
}

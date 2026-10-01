import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

// Vérification optimiste (présence du cookie). La session est réellement validée côté serveur
// dans chaque page : un cookie expiré mène donc à /login sans boucle de redirection.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next()

  const { pathname, search } = request.nextUrl
  const url = new URL("/login", request.url)
  url.searchParams.set("next", pathname + search)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

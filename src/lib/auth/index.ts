import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { db, schema } from "@/lib/db"

export const auth = betterAuth({
  appName: "QR Creator",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    deleteUser: { enabled: true },
  },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session

/** Session courante (mise en cache le temps d'une requête). */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

/** Session obligatoire : redirige vers la connexion si absente. */
export async function requireSession() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

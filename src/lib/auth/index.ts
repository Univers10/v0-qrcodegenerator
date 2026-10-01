import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { db, schema } from "@/lib/db"

const https = (host?: string) => (host ? `https://${host}` : undefined)

// URL de base : explicite, sinon déduite des variables système de Vercel.
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  https(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  https(process.env.VERCEL_URL)

export const auth = betterAuth({
  appName: "QR Creator",
  baseURL,
  // Autorise aussi les URL de prévisualisation propres à chaque déploiement Vercel.
  trustedOrigins: [https(process.env.VERCEL_URL), https(process.env.VERCEL_BRANCH_URL), https(process.env.VERCEL_PROJECT_PRODUCTION_URL)].filter(
    (o): o is string => Boolean(o),
  ),
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

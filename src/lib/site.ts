function resolveAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  // Variable système fournie automatiquement par Vercel aux projets Next.js
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  if (typeof window !== "undefined") return window.location.origin
  return "http://localhost:3000"
}

export const site = {
  name: "QR Creator",
  company: "UNIVERS10",
  description:
    "Créez des QR codes dynamiques au design unique, modifiez-les après impression et suivez chaque scan en temps réel.",
  get url() {
    return resolveAppUrl().replace(/\/$/, "")
  },
}

/** URL encodée dans un QR dynamique. */
export function shortUrl(shortCode: string) {
  return `${site.url}/r/${shortCode}`
}

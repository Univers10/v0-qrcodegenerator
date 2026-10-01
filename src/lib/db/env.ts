/**
 * Connexion libSQL. Accepte les noms génériques (DATABASE_*) et ceux injectés
 * automatiquement par l'intégration Turso du Vercel Marketplace (TURSO_*).
 */
export function databaseConfig() {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:data/qr-creator.db"
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined
  return { url, authToken }
}

import { mkdirSync } from "node:fs"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

import { databaseConfig } from "../src/lib/db/env"

const { url, authToken } = databaseConfig()

// Sur Vercel, le système de fichiers est éphémère : une base fichier perdrait toutes les données.
if (process.env.VERCEL && url.startsWith("file:")) {
  console.error(
    "✗ Aucune base distante configurée. Ajoutez l'intégration Turso (Vercel Marketplace) ou définissez DATABASE_URL et DATABASE_AUTH_TOKEN.",
  )
  process.exit(1)
}
if (url.startsWith("file:")) mkdirSync("data", { recursive: true })

const client = createClient({ url, authToken })
await migrate(drizzle(client), { migrationsFolder: "drizzle" })
client.close()
console.log(`✓ Base de données à jour (${url.startsWith("file:") ? "fichier local" : new URL(url).host})`)

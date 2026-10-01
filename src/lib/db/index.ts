import { createClient, type Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./schema"

const globalForDb = globalThis as unknown as { libsqlClient?: Client }

// En développement, on réutilise le client entre les rechargements à chaud.
const client =
  globalForDb.libsqlClient ??
  createClient({
    url: process.env.DATABASE_URL ?? "file:data/qr-creator.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  })

if (process.env.NODE_ENV !== "production") globalForDb.libsqlClient = client

export const db = drizzle(client, { schema })
export { schema }

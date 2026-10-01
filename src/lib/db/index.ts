import { createClient, type Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { databaseConfig } from "./env"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as { libsqlClient?: Client }

// En développement, on réutilise le client entre les rechargements à chaud.
const client = globalForDb.libsqlClient ?? createClient(databaseConfig())

if (process.env.NODE_ENV !== "production") globalForDb.libsqlClient = client

export const db = drizzle(client, { schema })
export { schema }

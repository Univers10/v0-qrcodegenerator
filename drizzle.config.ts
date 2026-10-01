import { defineConfig } from "drizzle-kit"

import { databaseConfig } from "./src/lib/db/env"

const { url, authToken } = databaseConfig()

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: { url, authToken },
})

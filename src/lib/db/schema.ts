import { relations, sql } from "drizzle-orm"
import { blob, index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date()),
}

/* ------------------------------------------------------------------ */
/* Authentification (tables attendues par Better Auth)                 */
/* ------------------------------------------------------------------ */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  ...timestamps,
})

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_idx").on(t.userId)],
)

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_idx").on(t.userId)],
)

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
})

/* ------------------------------------------------------------------ */
/* Domaine : QR codes et scans                                         */
/* ------------------------------------------------------------------ */

export const qrCode = sqliteTable(
  "qr_code",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    /** Contenu structuré propre au type (JSON validé par zod). */
    data: text("data", { mode: "json" }).notNull(),
    /** Options de design (JSON validé par zod). */
    design: text("design", { mode: "json" }).notNull(),
    isDynamic: integer("is_dynamic", { mode: "boolean" }).notNull().default(false),
    /** Code court utilisé dans l'URL de redirection /r/{shortCode}. */
    shortCode: text("short_code").notNull().unique(),
    status: text("status", { enum: ["active", "paused"] }).notNull().default("active"),
    scanCount: integer("scan_count").notNull().default(0),
    lastScannedAt: integer("last_scanned_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [index("qr_code_user_idx").on(t.userId, t.createdAt)],
)

export const scan = sqliteTable(
  "scan",
  {
    id: text("id").primaryKey(),
    qrCodeId: text("qr_code_id")
      .notNull()
      .references(() => qrCode.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    device: text("device").notNull(),
    os: text("os").notNull(),
    browser: text("browser").notNull(),
    country: text("country"),
    city: text("city"),
    referer: text("referer"),
    /** Empreinte anonymisée (hachage salé IP + agent, renouvelée chaque jour). */
    visitorHash: text("visitor_hash").notNull(),
  },
  (t) => [index("scan_qr_created_idx").on(t.qrCodeId, t.createdAt)],
)

/** Images importées (photos de menu, logos, couvertures), servies par /api/assets/{id}. */
export const asset = sqliteTable(
  "asset",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    data: blob("data", { mode: "buffer" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("asset_user_idx").on(t.userId, t.createdAt)],
)

export type OrderLine = {
  itemId: string
  name: string
  variant: string | null
  options: string[]
  quantity: number
  unitPrice: number
  total: number
}

/** Commandes passées depuis un menu (panier + WhatsApp), suivies dans le tableau de bord. */
export const customerOrder = sqliteTable(
  "customer_order",
  {
    id: text("id").primaryKey(),
    qrCodeId: text("qr_code_id")
      .notNull()
      .references(() => qrCode.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Numéro lisible, séquentiel par menu (#1, #2…) */
    number: integer("number").notNull(),
    /** Jeton public de la page de suivi /o/{token} */
    token: text("token").notNull().unique(),
    status: text("status", { enum: ["new", "preparing", "ready", "delivering", "completed", "cancelled"] })
      .notNull()
      .default("new"),
    mode: text("mode", { enum: ["delivery", "pickup", "dine_in"] }).notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    address: text("address"),
    tableNumber: text("table_number"),
    note: text("note"),
    items: text("items", { mode: "json" }).$type<OrderLine[]>().notNull(),
    subtotal: real("subtotal").notNull(),
    deliveryFee: real("delivery_fee").notNull().default(0),
    total: real("total").notNull(),
    currency: text("currency").notNull(),
    /** Empreinte anonymisée de l'expéditeur, pour limiter les abus */
    senderHash: text("sender_hash").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("order_number_idx").on(t.qrCodeId, t.number),
    index("order_user_created_idx").on(t.userId, t.createdAt),
    index("order_sender_idx").on(t.qrCodeId, t.senderHash, t.createdAt),
  ],
)

export type CustomerOrderRow = typeof customerOrder.$inferSelect

export const userRelations = relations(user, ({ many }) => ({
  qrCodes: many(qrCode),
}))

export const qrCodeRelations = relations(qrCode, ({ one, many }) => ({
  user: one(user, { fields: [qrCode.userId], references: [user.id] }),
  scans: many(scan),
}))

export const scanRelations = relations(scan, ({ one }) => ({
  qrCode: one(qrCode, { fields: [scan.qrCodeId], references: [qrCode.id] }),
}))

export type QrCodeRow = typeof qrCode.$inferSelect
export type ScanRow = typeof scan.$inferSelect

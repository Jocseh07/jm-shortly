import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    shortCode: text("short_code").notNull().unique(),
    originalUrl: text("original_url").notNull(),
    userId: text("user_id"),
    clicks: integer("clicks").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    activateAt: integer("activate_at", { mode: "timestamp" }),
    expirationMessage: text("expiration_message"),
  },
  (table) => ({
    shortCodeIdx: index("short_code_idx").on(table.shortCode),
    userIdIdx: index("user_id_idx").on(table.userId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
    clicksIdx: index("clicks_idx").on(table.clicks),
  })
);

export const clicks = sqliteTable(
  "clicks",
  {
    id: text("id").primaryKey(),
    linkId: text("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    referer: text("referer"),
    country: text("country"),
    city: text("city"),
    deviceType: text("device_type"),
  },
  (table) => ({
    linkIdIdx: index("link_id_idx").on(table.linkId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;

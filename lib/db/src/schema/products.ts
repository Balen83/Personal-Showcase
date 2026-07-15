import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price", { mode: "number" }).notNull(),
  currency: text("currency").notNull().default("usd"), // 'usd' | 'iqd'
  imageUrl: text("image_url").notNull(),
  images: text("images").array().notNull().default([]),
  size: text("size").notNull().default(""),
  conditionRating: integer("condition_rating"),
  description: text("description").notNull(),
  location: text("location").notNull(),
  sellerEmail: text("seller_email").notNull(),
  sellerName: text("seller_name"),
  sold: boolean("sold").notNull().default(false),
  pinned: boolean("pinned").notNull().default(false),
  pinnedUntil: timestamp("pinned_until", { withTimezone: true }),
  verified: boolean("verified").notNull().default(false),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  sold: true,
  pinned: true,
  pinnedUntil: true,
  verified: true,
  views: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductRow = typeof productsTable.$inferSelect;

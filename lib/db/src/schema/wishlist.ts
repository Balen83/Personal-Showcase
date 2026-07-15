import { pgTable, text, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wishlistTable = pgTable(
  "wishlist",
  {
    id: serial("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    productId: integer("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userEmail, table.productId)]
);

export const insertWishlistSchema = createInsertSchema(wishlistTable).omit({
  id: true,
  createdAt: true,
});
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type WishlistRow = typeof wishlistTable.$inferSelect;

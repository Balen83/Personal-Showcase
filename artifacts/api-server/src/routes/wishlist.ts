import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, wishlistTable } from "@workspace/db";
import {
  ListWishlistResponse,
  AddWishlistItemBody,
  AddWishlistItemResponse,
  RemoveWishlistItemParams,
} from "@workspace/api-zod";
import { normalizeEmail } from "../lib/roles";

const router: IRouter = Router();

router.get("/wishlist", async (req, res): Promise<void> => {
  const email = normalizeEmail(String(req.query.email ?? ""));
  const rows = await db.select().from(wishlistTable).where(eq(wishlistTable.userEmail, email));
  res.json(ListWishlistResponse.parse(rows));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const parsed = AddWishlistItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userEmail = normalizeEmail(parsed.data.userEmail);

  const [existing] = await db
    .select()
    .from(wishlistTable)
    .where(and(eq(wishlistTable.userEmail, userEmail), eq(wishlistTable.productId, parsed.data.productId)));

  if (existing) {
    res.status(201).json(AddWishlistItemResponse.parse(existing));
    return;
  }

  const [row] = await db
    .insert(wishlistTable)
    .values({ userEmail, productId: parsed.data.productId })
    .returning();

  res.status(201).json(AddWishlistItemResponse.parse(row));
});

router.delete("/wishlist/:id", async (req, res): Promise<void> => {
  const params = RemoveWishlistItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(wishlistTable).where(eq(wishlistTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

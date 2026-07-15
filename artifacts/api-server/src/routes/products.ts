import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, productsTable, usersTable } from "@workspace/db";
import {
  ListProductsResponse,
  CreateProductBody,
  CreateProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
  DeleteProductBody,
  RecordProductViewParams,
  RecordProductViewResponse,
} from "@workspace/api-zod";
import { normalizeEmail, isSuperAdmin, effectiveRole, canModerate } from "../lib/roles";

const router: IRouter = Router();

async function getActorRole(actorEmail: string) {
  const email = normalizeEmail(actorEmail);
  if (isSuperAdmin(email)) return "super_admin" as const;
  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return effectiveRole(email, row?.role ?? "user");
}

function isPinActive(product: { pinned: boolean; pinnedUntil: Date | null }) {
  return product.pinned && product.pinnedUntil && product.pinnedUntil.getTime() > Date.now();
}

router.get("/products", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  const sorted = [...rows].sort((a, b) => {
    const aPinned = isPinActive(a) ? 1 : 0;
    const bPinned = isPinActive(b) ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  res.json(ListProductsResponse.parse(sorted));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(productsTable)
    .values({
      ...parsed.data,
      sellerEmail: normalizeEmail(parsed.data.sellerEmail),
    })
    .returning();

  res.status(201).json(CreateProductResponse.parse(row));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const actorEmail = normalizeEmail(parsed.data.actorEmail);
  const actorRole = await getActorRole(actorEmail);
  const isOwner = actorEmail === existing.sellerEmail;
  const wantsPinChange =
    parsed.data.pinned !== undefined || parsed.data.pinHours !== undefined || parsed.data.verified !== undefined;
  const wantsContentChange =
    parsed.data.name !== undefined ||
    parsed.data.price !== undefined ||
    parsed.data.imageUrl !== undefined ||
    parsed.data.images !== undefined ||
    parsed.data.size !== undefined ||
    parsed.data.conditionRating !== undefined ||
    parsed.data.currency !== undefined ||
    parsed.data.description !== undefined ||
    parsed.data.location !== undefined ||
    parsed.data.sold !== undefined;

  if (wantsContentChange && !isOwner) {
    res.status(403).json({ error: "Only the seller can edit this listing" });
    return;
  }
  if (wantsPinChange && !canModerate(actorRole)) {
    res.status(403).json({ error: "Only admins can pin listings" });
    return;
  }

  if (parsed.data.verified !== undefined && !canModerate(actorRole)) {
    res.status(403).json({ error: "Only admins can verify listings" });
    return;
  }

  const update: Partial<typeof productsTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.price !== undefined) update.price = parsed.data.price;
  if (parsed.data.currency !== undefined) update.currency = parsed.data.currency;
  if (parsed.data.imageUrl !== undefined) update.imageUrl = parsed.data.imageUrl;
  if (parsed.data.images !== undefined) update.images = parsed.data.images;
  if (parsed.data.size !== undefined) update.size = parsed.data.size;
  if (parsed.data.conditionRating !== undefined) update.conditionRating = parsed.data.conditionRating;
  if (parsed.data.description !== undefined) update.description = parsed.data.description;
  if (parsed.data.location !== undefined) update.location = parsed.data.location;
  if (parsed.data.sold !== undefined) update.sold = parsed.data.sold;
  if (parsed.data.verified !== undefined) update.verified = parsed.data.verified;
  if (parsed.data.pinned !== undefined) {
    update.pinned = parsed.data.pinned;
    update.pinnedUntil = parsed.data.pinned
      ? new Date(Date.now() + (parsed.data.pinHours ?? 12) * 60 * 60 * 1000)
      : null;
  } else if (parsed.data.pinHours !== undefined && existing.pinned) {
    update.pinnedUntil = new Date(Date.now() + parsed.data.pinHours * 60 * 60 * 1000);
  }

  const [row] = await db.update(productsTable).set(update).where(eq(productsTable.id, params.data.id)).returning();

  res.json(UpdateProductResponse.parse(row));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = DeleteProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const actorEmail = normalizeEmail(parsed.data.actorEmail);
  const actorRole = await getActorRole(actorEmail);
  const isOwner = actorEmail === existing.sellerEmail;

  if (!isOwner && !canModerate(actorRole)) {
    res.status(403).json({ error: "Not authorized to delete this listing" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/products/:id/view", async (req, res): Promise<void> => {
  const params = RecordProductViewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [row] = await db
    .update(productsTable)
    .set({ views: existing.views + 1 })
    .where(eq(productsTable.id, params.data.id))
    .returning();

  res.json(RecordProductViewResponse.parse(row));
});

export default router;

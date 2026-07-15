import { Router, type IRouter } from "express";
import { desc, eq, or } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { ListOrdersQueryParams, ListOrdersResponse, CreateOrderBody, CreateOrderResponse } from "@workspace/api-zod";
import { normalizeEmail } from "../lib/roles";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const email = normalizeEmail(query.data.email);
  const rows = await db
    .select()
    .from(ordersTable)
    .where(or(eq(ordersTable.sellerEmail, email), eq(ordersTable.buyerEmail, email)))
    .orderBy(desc(ordersTable.createdAt));

  res.json(ListOrdersResponse.parse(rows));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(ordersTable)
    .values({
      ...parsed.data,
      sellerEmail: normalizeEmail(parsed.data.sellerEmail),
      buyerEmail: normalizeEmail(parsed.data.buyerEmail),
    })
    .returning();

  res.status(201).json(CreateOrderResponse.parse(row));
});

export default router;

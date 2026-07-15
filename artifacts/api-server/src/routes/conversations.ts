import { Router, type IRouter } from "express";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import {
  ListConversationsQueryParams,
  ListConversationsResponse,
  CreateConversationBody,
  CreateConversationResponse,
  ListMessagesParams,
  ListMessagesResponse,
  CreateMessageParams,
  CreateMessageBody,
  CreateMessageResponse,
} from "@workspace/api-zod";
import { normalizeEmail } from "../lib/roles";

const router: IRouter = Router();

router.get("/conversations", async (req, res): Promise<void> => {
  const query = ListConversationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const email = normalizeEmail(query.data.email);
  const rows = await db
    .select()
    .from(conversationsTable)
    .where(or(eq(conversationsTable.sellerEmail, email), eq(conversationsTable.buyerEmail, email)))
    .orderBy(desc(conversationsTable.lastMessageAt));

  res.json(ListConversationsResponse.parse(rows));
});

router.post("/conversations", async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sellerEmail = normalizeEmail(parsed.data.sellerEmail);
  const buyerEmail = normalizeEmail(parsed.data.buyerEmail);

  const [existing] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.productId, parsed.data.productId),
        eq(conversationsTable.sellerEmail, sellerEmail),
        eq(conversationsTable.buyerEmail, buyerEmail),
      ),
    );

  if (existing) {
    res.status(201).json(CreateConversationResponse.parse(existing));
    return;
  }

  const [row] = await db
    .insert(conversationsTable)
    .values({ ...parsed.data, sellerEmail, buyerEmail })
    .returning();

  res.status(201).json(CreateConversationResponse.parse(row));
});

router.get("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(ListMessagesResponse.parse(rows));
});

router.post("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = CreateMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const [row] = await db
    .insert(messagesTable)
    .values({
      conversationId: params.data.id,
      senderEmail: normalizeEmail(parsed.data.senderEmail),
      text: parsed.data.text,
    })
    .returning();

  await db
    .update(conversationsTable)
    .set({ lastMessageAt: row.createdAt })
    .where(eq(conversationsTable.id, params.data.id));

  res.status(201).json(CreateMessageResponse.parse(row));
});

export default router;

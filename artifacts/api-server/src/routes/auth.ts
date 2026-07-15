import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  SignupBody,
  SignupResponse,
  LoginBody,
  LoginResponse,
  ListUsersResponse,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
  UpdateUserRoleParams,
  UpdateUserRoleBody,
  UpdateUserRoleResponse,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { normalizeEmail, isSuperAdmin, effectiveRole } from "../lib/roles";

const router: IRouter = Router();

function toUserResponse(row: { email: string; name: string | null; avatarUrl: string | null; role: string; createdAt: Date }) {
  return {
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    role: effectiveRole(row.email, row.role),
    createdAt: row.createdAt,
  };
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = normalizeEmail(parsed.data.email);

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const [row] = await db
    .insert(usersTable)
    .values({
      email,
      password: hashPassword(parsed.data.password),
      name: parsed.data.name,
      avatarUrl: parsed.data.avatarUrl,
      role: isSuperAdmin(email) ? "super_admin" : "user",
    })
    .returning();

  res.status(201).json(SignupResponse.parse(toUserResponse(row)));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = normalizeEmail(parsed.data.email);
  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!row || !verifyPassword(parsed.data.password, row.password)) {
    res.status(401).json({ error: "Incorrect email or password" });
    return;
  }

  res.json(LoginResponse.parse(toUserResponse(row)));
});

router.get("/users", async (_req, res): Promise<void> => {
  const rows = await db.select().from(usersTable);
  res.json(ListUsersResponse.parse(rows.map(toUserResponse)));
});

router.patch("/users/:email", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = normalizeEmail(params.data.email);
  const [row] = await db
    .update(usersTable)
    .set({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl } : {}),
    })
    .where(eq(usersTable.email, email))
    .returning();

  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateUserResponse.parse(toUserResponse(row)));
});

router.patch("/users/:email/role", async (req, res): Promise<void> => {
  const params = UpdateUserRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateUserRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const actorEmail = normalizeEmail(parsed.data.actorEmail);
  if (!isSuperAdmin(actorEmail)) {
    res.status(403).json({ error: "Only the super admin can manage the team" });
    return;
  }

  const targetEmail = normalizeEmail(params.data.email);
  if (isSuperAdmin(targetEmail)) {
    res.status(403).json({ error: "The super admin's role cannot be changed" });
    return;
  }

  const [row] = await db
    .update(usersTable)
    .set({ role: parsed.data.role })
    .where(eq(usersTable.email, targetEmail))
    .returning();

  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateUserRoleResponse.parse(toUserResponse(row)));
});

export default router;

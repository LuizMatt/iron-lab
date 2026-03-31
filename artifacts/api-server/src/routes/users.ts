import { Router, IRouter } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(authenticate);

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["aluno", "professor", "admin"]).default("aluno"),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

router.get("/", requireRole("admin", "professor"), async (req: AuthRequest, res) => {
  try {
    const role = req.query.role as string | undefined;
    let users;
    if (role) {
      users = await db.select().from(usersTable).where(eq(usersTable.role, role));
    } else {
      users = await db.select().from(usersTable);
    }
    res.json(users.map(formatUser));
  } catch (err) {
    req.log.error({ err }, "Get users error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", requireRole("admin", "professor"), async (req: AuthRequest, res) => {
  const parse = createUserSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { name, email, password, role, phone } = parse.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role, phone }).returning();
    res.status(201).json(formatUser(user));
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Email já cadastrado" });
      return;
    }
    req.log.error({ err }, "Create user error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (req.user!.role === "aluno" && req.user!.id !== id) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Get user by id error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (req.user!.role === "aluno" && req.user!.id !== id) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const parse = updateUserSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  try {
    const [user] = await db.update(usersTable).set(parse.data).where(eq(usersTable.id, id)).returning();
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Update user error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:id", requireRole("admin"), async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ success: true, message: "Usuário removido" });
  } catch (err) {
    req.log.error({ err }, "Delete user error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

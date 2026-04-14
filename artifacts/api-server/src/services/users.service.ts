import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";

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

export const usersService = {
  async getAll(role?: string) {
    const rows = role
      ? await db.select().from(usersTable).where(eq(usersTable.role, role))
      : await db.select().from(usersTable);
    return rows.map(formatUser);
  },

  async getById(id: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!user) throw new AppError(404, "Usuário não encontrado");
    return formatUser(user);
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    try {
      const [user] = await db
        .insert(usersTable)
        .values({
          name: data.name,
          email: data.email,
          passwordHash,
          role: data.role,
          phone: data.phone,
        })
        .returning();
      return formatUser(user);
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "23505")
        throw new AppError(409, "Email já cadastrado");
      throw err;
    }
  },

  async update(
    id: string,
    data: { name?: string; email?: string; phone?: string; avatarUrl?: string },
  ) {
    const [user] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();
    if (!user) throw new AppError(404, "Usuário não encontrado");
    return formatUser(user);
  },

  async delete(id: string) {
    await db.delete(usersTable).where(eq(usersTable.id, id));
  },
};

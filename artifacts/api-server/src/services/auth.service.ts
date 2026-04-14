import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";

const JWT_SECRET = process.env.JWT_SECRET || "ironlab_secret_key_dev";

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

export const authService = {
  async login(email: string, password: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) throw new AppError(401, "Credenciais inválidas");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Credenciais inválidas");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return { token, user: formatUser(user) };
  },

  async getMe(userId: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) throw new AppError(404, "Usuário não encontrado");

    return formatUser(user);
  },
};

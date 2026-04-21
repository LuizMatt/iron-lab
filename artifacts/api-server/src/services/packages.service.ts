import { db, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";

export const packagesService = {
  async getActive() {
    return db
      .select()
      .from(packagesTable)
      .where(eq(packagesTable.is_active, true))
      .orderBy(packagesTable.display_order);
  },

  async getAll() {
    return db
      .select()
      .from(packagesTable)
      .orderBy(packagesTable.display_order);
  },

  async create(data: {
    name: string;
    subtitle: string;
    price: number;
    features: string[];
    is_featured?: boolean;
    is_active?: boolean;
    display_order?: number;
  }) {
    const [pkg] = await db
      .insert(packagesTable)
      .values(data)
      .returning();
    return pkg;
  },

  async update(
    id: string,
    data: {
      name?: string;
      subtitle?: string;
      price?: number;
      features?: string[];
      is_featured?: boolean;
      is_active?: boolean;
      display_order?: number;
    }
  ) {
    const [pkg] = await db
      .update(packagesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(packagesTable.id, id))
      .returning();
    if (!pkg) throw new AppError(404, "Pacote não encontrado");
    return pkg;
  },

  async remove(id: string) {
    const [pkg] = await db
      .delete(packagesTable)
      .where(eq(packagesTable.id, id))
      .returning();
    if (!pkg) throw new AppError(404, "Pacote não encontrado");
  },
};

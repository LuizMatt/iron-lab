import { db, sliderImages } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

export const sliderImagesService = {
  async getActive() {
    return db   
      .select()
      .from(sliderImages)
      .where(eq(sliderImages.is_active, true))
      .orderBy(asc(sliderImages.display_order));
  },

  async getAll() {
    return db
      .select()
      .from(sliderImages)
      .orderBy(asc(sliderImages.display_order));
  },

  async create(data: any) {
    const [created] = await db.insert(sliderImages).values(data).returning();
    return created;
  },

  async update(id: string, data: any) {
    const [updated] = await db
      .update(sliderImages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sliderImages.id, id))
      .returning();

    return updated;
  },

  async remove(id: string) {
    await db.delete(sliderImages).where(eq(sliderImages.id, id));
  },
};
import { db, sliderImages } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";

function deleteFileIfExists(filePath: string | null | undefined) {
  if (!filePath) return;
  // Converte "/uploads/sliderImages/abc.jpg" → "/app/uploads/sliderImages/abc.jpg"
  const absolute = path.join("/app", filePath);
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
}

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

  async create(data: {
    image_url: string;
    mobile_image_url?: string | null;
    alt_text: string;
    display_order: number;
    is_active?: boolean;
  }) {
    const [created] = await db.insert(sliderImages).values(data).returning();
    return created;
  },

  async update(
    id: string,
    data: {
      image_url?: string;
      mobile_image_url?: string | null;
      alt_text?: string;
      display_order?: number;
      is_active?: boolean;
    }
  ) {
    if (data.image_url || data.mobile_image_url !== undefined) {
      const [current] = await db
        .select()
        .from(sliderImages)
        .where(eq(sliderImages.id, id))
        .limit(1);
      if (current) {
        if (data.image_url) deleteFileIfExists(current.image_url);
        if (data.mobile_image_url !== undefined) deleteFileIfExists(current.mobile_image_url);
      }
    }

    const [updated] = await db
      .update(sliderImages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sliderImages.id, id))
      .returning();
    return updated;
  },

  async remove(id: string) {
    const [current] = await db
      .select()
      .from(sliderImages)
      .where(eq(sliderImages.id, id))
      .limit(1);

    if (current) {
      deleteFileIfExists(current.image_url);
      deleteFileIfExists(current.mobile_image_url);
    }

    await db.delete(sliderImages).where(eq(sliderImages.id, id));
  },
};
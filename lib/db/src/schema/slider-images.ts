import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const sliderImages = pgTable("slider_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  image_url: text("image_url").notNull(),
  mobile_image_url: text("mobile_image_url"),

  alt_text: text("alt_text").notNull(),
  display_order: integer("display_order").notNull(),

  is_active: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSliderImageSchema = createInsertSchema(sliderImages);

export type SliderImage = typeof sliderImages.$inferSelect;
export type NewSliderImage = typeof sliderImages.$inferInsert;
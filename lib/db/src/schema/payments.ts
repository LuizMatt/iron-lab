import { pgTable, text, decimal, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  dueDate: varchar("due_date", { length: 20 }).notNull(),
  paidAt: timestamp("paid_at"),
  pixQrCode: text("pix_qr_code"),
  pixCopyPaste: text("pix_copy_paste"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plansTable = pgTable("plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  nextDueDate: varchar("next_due_date", { length: 20 }),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
export type Plan = typeof plansTable.$inferSelect;

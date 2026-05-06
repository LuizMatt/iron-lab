import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const workoutCheckinsTable = pgTable("workout_checkins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  photoUrl: varchar("photo_url", { length: 500 }),
  checkedInAt: timestamp("checked_in_at").defaultNow().notNull(),
});

export const insertWorkoutCheckinSchema = createInsertSchema(workoutCheckinsTable).omit({
  id: true,
  checkedInAt: true,
});

export type InsertWorkoutCheckin = z.infer<typeof insertWorkoutCheckinSchema>;
export type WorkoutCheckin = typeof workoutCheckinsTable.$inferSelect;

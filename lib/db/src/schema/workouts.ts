import { pgTable, text, boolean, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workoutsTable = pgTable("workouts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  muscleGroups: text("muscle_groups"),
  createdBy: text("created_by"),
  isCustom: boolean("is_custom").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercisesTable = pgTable("exercises", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workoutId: text("workout_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sets: integer("sets").notNull(),
  reps: varchar("reps", { length: 50 }).notNull(),
  restSeconds: integer("rest_seconds").default(60),
});

export const workoutAssignmentsTable = pgTable("workout_assignments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workoutId: text("workout_id").notNull(),
  userId: text("user_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const workoutLogsTable = pgTable("workout_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  workoutId: text("workout_id").notNull(),
  completedAt: varchar("completed_at", { length: 20 }).notNull(),
});

export const insertWorkoutSchema = createInsertSchema(workoutsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workoutsTable.$inferSelect;
export type Exercise = typeof exercisesTable.$inferSelect;

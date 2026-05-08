import {
  db,
  workoutsTable,
  exercisesTable,
  workoutAssignmentsTable,
  workoutLogsTable,
  type Workout,
  type Exercise,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";
import { badgesService } from "./badges.service.js";

async function getWorkoutWithExercises(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workoutsTable)
    .where(eq(workoutsTable.id, workoutId))
    .limit(1);

  if (!workout) return null;

  const exercises = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.workoutId, workoutId));

  return {
    ...workout,
    exercises: exercises.map((e: Exercise) => ({
      id: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      restSeconds: e.restSeconds,
    })),
  };
}

export const workoutsService = {
  async getForUser(userId: string, role: string) {
    let workoutIds: string[];

    if (role === "aluno") {
      const assignments = await db
        .select()
        .from(workoutAssignmentsTable)
        .where(eq(workoutAssignmentsTable.userId, userId));

      const custom = await db
        .select()
        .from(workoutsTable)
        .where(eq(workoutsTable.createdBy, userId));

      workoutIds = [
        ...new Set([...assignments.map((a) => a.workoutId), ...custom.map((w) => w.id)]),
      ];
    } else {
      const all = await db.select().from(workoutsTable);
      workoutIds = all.map((w) => w.id);
    }

    if (workoutIds.length === 0) return [];

    const workouts = await db
      .select()
      .from(workoutsTable)
      .where(inArray(workoutsTable.id, workoutIds));

    const allExercises = await db
      .select()
      .from(exercisesTable)
      .where(inArray(exercisesTable.workoutId, workoutIds));

    return workouts.map((w: Workout) => ({
      ...w,
      exercises: allExercises
        .filter((e: Exercise) => e.workoutId === w.id)
        .map((e: Exercise) => ({
          id: e.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          restSeconds: e.restSeconds,
        })),
    }));
  },

  async create(
    data: {
      name: string;
      description?: string;
      muscleGroups?: string;
      isCustom?: boolean;
      exercises: { name: string; sets: number; reps: string; restSeconds?: number }[];
    },
    createdBy: string,
  ) {
    const [workout] = await db
      .insert(workoutsTable)
      .values({
        name: data.name,
        description: data.description ?? null,
        muscleGroups: data.muscleGroups ?? null,
        createdBy,
        isCustom: data.isCustom ?? false,
      })
      .returning();

    await db.insert(exercisesTable).values(
      data.exercises.map((e) => ({
        workoutId: workout.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds ?? 60,
      })),
    );

    return await getWorkoutWithExercises(workout.id);
  },

  async update(
    id: string,
    data: {
      name: string;
      description?: string;
      muscleGroups?: string;
      exercises: { name: string; sets: number; reps: string; restSeconds?: number }[];
    },
  ) {
    await db
      .update(workoutsTable)
      .set({ 
        name: data.name, 
        description: data.description ?? null, 
        muscleGroups: data.muscleGroups ?? null 
      })
      .where(eq(workoutsTable.id, id));

    await db.delete(exercisesTable).where(eq(exercisesTable.workoutId, id));

    await db.insert(exercisesTable).values(
      data.exercises.map((e) => ({
        workoutId: id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds ?? 60,
      })),
    );

    const result = await getWorkoutWithExercises(id);
    if (!result) throw new AppError(404, "Treino não encontrado");
    return result;
  },

  async delete(id: string) {
    await db.delete(exercisesTable).where(eq(exercisesTable.workoutId, id));
    await db.delete(workoutAssignmentsTable).where(eq(workoutAssignmentsTable.workoutId, id));
    await db.delete(workoutsTable).where(eq(workoutsTable.id, id));
  },

  async assign(workoutId: string, userIds: string[]) {
    for (const userId of userIds) {
      const existing = await db
        .select()
        .from(workoutAssignmentsTable)
        .where(
          and(
            eq(workoutAssignmentsTable.workoutId, workoutId),
            eq(workoutAssignmentsTable.userId, userId)
          )
        );

      if (existing.length === 0) {
        await db.insert(workoutAssignmentsTable).values({ workoutId, userId });
      }
    }
  },

  async complete(workoutId: string, userId: string) {
    // Pegamos a data e forçamos o tipo string explicitamente
    const today = new Date().toISOString().split("T")[0];
    const [alreadyLogged] = await db
      .select()
      .from(workoutLogsTable)
      .where(
        and(
          eq(workoutLogsTable.userId, userId as string),
          eq(workoutLogsTable.workoutId, workoutId as string),
          eq(workoutLogsTable.completedAt, today)
        )
      )
      .limit(1);

    if (!alreadyLogged) {
      await db.insert(workoutLogsTable).values({ 
        userId: userId as string, 
        workoutId: workoutId as string, 
        completedAt: today 
      });

      await badgesService.checkAndAward(userId);
    }
  },
};
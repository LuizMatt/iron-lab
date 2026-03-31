import { Router, IRouter } from "express";
import { db, workoutsTable, exercisesTable, workoutAssignmentsTable, workoutLogsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(authenticate);

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.string().min(1),
  restSeconds: z.number().int().optional().default(60),
});

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  muscleGroups: z.string().optional(),
  isCustom: z.boolean().optional().default(false),
  exercises: z.array(exerciseSchema).min(1),
});

const assignSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

async function getWorkoutWithExercises(workoutId: string) {
  const [workout] = await db.select().from(workoutsTable).where(eq(workoutsTable.id, workoutId)).limit(1);
  if (!workout) return null;
  const exercises = await db.select().from(exercisesTable).where(eq(exercisesTable.workoutId, workoutId));
  return {
    ...workout,
    exercises: exercises.map(e => ({
      id: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      restSeconds: e.restSeconds,
    })),
  };
}

router.get("/", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let workoutIds: string[];

    if (user.role === "aluno") {
      const assignments = await db.select().from(workoutAssignmentsTable).where(eq(workoutAssignmentsTable.userId, user.id));
      const customWorkouts = await db.select().from(workoutsTable).where(eq(workoutsTable.createdBy, user.id));
      const assignedIds = assignments.map(a => a.workoutId);
      const customIds = customWorkouts.map(w => w.id);
      workoutIds = [...new Set([...assignedIds, ...customIds])];
    } else {
      const all = await db.select().from(workoutsTable);
      workoutIds = all.map(w => w.id);
    }

    if (workoutIds.length === 0) {
      res.json([]);
      return;
    }

    const workouts = await db.select().from(workoutsTable).where(inArray(workoutsTable.id, workoutIds));
    const allExercises = await db.select().from(exercisesTable).where(inArray(exercisesTable.workoutId, workoutIds));

    const result = workouts.map(w => ({
      ...w,
      exercises: allExercises.filter(e => e.workoutId === w.id).map(e => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
      })),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Get workouts error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = createWorkoutSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { name, description, muscleGroups, isCustom, exercises } = parse.data;

  try {
    const [workout] = await db.insert(workoutsTable).values({
      name,
      description: description ?? null,
      muscleGroups: muscleGroups ?? null,
      createdBy: req.user!.id,
      isCustom: isCustom ?? false,
    }).returning();

    await db.insert(exercisesTable).values(
      exercises.map(e => ({
        workoutId: workout.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds ?? 60,
      }))
    );

    const result = await getWorkoutWithExercises(workout.id);
    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Create workout error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parse = createWorkoutSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { name, description, muscleGroups, exercises } = parse.data;
  const { id } = req.params;

  try {
    await db.update(workoutsTable).set({ name, description: description ?? null, muscleGroups: muscleGroups ?? null }).where(eq(workoutsTable.id, id));
    await db.delete(exercisesTable).where(eq(exercisesTable.workoutId, id));
    await db.insert(exercisesTable).values(
      exercises.map(e => ({
        workoutId: id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds ?? 60,
      }))
    );
    const result = await getWorkoutWithExercises(id);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Update workout error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    await db.delete(exercisesTable).where(eq(exercisesTable.workoutId, id));
    await db.delete(workoutAssignmentsTable).where(eq(workoutAssignmentsTable.workoutId, id));
    await db.delete(workoutsTable).where(eq(workoutsTable.id, id));
    res.json({ success: true, message: "Treino removido" });
  } catch (err) {
    req.log.error({ err }, "Delete workout error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/:id/assign", requireRole("admin", "professor"), async (req: AuthRequest, res) => {
  const parse = assignSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { id } = req.params;
  const { userIds } = parse.data;

  try {
    for (const userId of userIds) {
      const existing = await db.select().from(workoutAssignmentsTable)
        .where(eq(workoutAssignmentsTable.workoutId, id))
        .limit(1);
      const alreadyAssigned = existing.some(a => a.userId === userId);
      if (!alreadyAssigned) {
        await db.insert(workoutAssignmentsTable).values({ workoutId: id, userId });
      }
    }
    res.json({ success: true, message: "Treino atribuído com sucesso" });
  } catch (err) {
    req.log.error({ err }, "Assign workout error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/:id/complete", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().split("T")[0];

  try {
    const existing = await db.select().from(workoutLogsTable)
      .where(eq(workoutLogsTable.userId, req.user!.id))
      .limit(100);

    const alreadyLogged = existing.some(l => l.workoutId === id && l.completedAt === today);
    if (!alreadyLogged) {
      await db.insert(workoutLogsTable).values({
        userId: req.user!.id,
        workoutId: id,
        completedAt: today,
      });
    }

    res.json({ success: true, message: "Treino concluído!" });
  } catch (err) {
    req.log.error({ err }, "Complete workout error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

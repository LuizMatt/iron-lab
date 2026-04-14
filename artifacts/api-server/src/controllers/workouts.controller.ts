import { Response, NextFunction } from "express";
import { z } from "zod";
import { workoutsService } from "../services/workouts.service.js";
import { AuthRequest } from "../middlewares/auth.js";

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.string().min(1),
  restSeconds: z.number().int().optional().default(60),
});

const workoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  muscleGroups: z.string().optional(),
  isCustom: z.boolean().optional().default(false),
  exercises: z.array(exerciseSchema).min(1),
});

const assignSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

export const workoutsController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workouts = await workoutsService.getForUser(req.user!.id, req.user!.role);
      res.json(workouts);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = workoutSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const workout = await workoutsService.create(parse.data, req.user!.id);
      res.status(201).json(workout);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = workoutSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const workout = await workoutsService.update(req.params.id, parse.data);
      res.json(workout);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workoutsService.delete(req.params.id);
      res.json({ success: true, message: "Treino removido" });
    } catch (err) {
      next(err);
    }
  },

  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = assignSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      await workoutsService.assign(req.params.id, parse.data.userIds);
      res.json({ success: true, message: "Treino atribuído com sucesso" });
    } catch (err) {
      next(err);
    }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workoutsService.complete(req.params.id, req.user!.id);
      res.json({ success: true, message: "Treino concluído!" });
    } catch (err) {
      next(err);
    }
  },
};

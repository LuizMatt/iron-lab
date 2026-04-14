import { Response, NextFunction } from "express";
import { gamificationService } from "../services/gamification.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const gamificationController = {
  async getStreak(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const streak = await gamificationService.getStreak(req.user!.id);
      res.json(streak);
    } catch (err) {
      next(err);
    }
  },
};

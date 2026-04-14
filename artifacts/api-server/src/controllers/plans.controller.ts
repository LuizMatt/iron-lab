import { Response, NextFunction } from "express";
import { plansService } from "../services/plans.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const plansController = {
  async getMyPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await plansService.getMyPlan(req.user!.id);
      res.json(plan);
    } catch (err) {
      next(err);
    }
  },
};

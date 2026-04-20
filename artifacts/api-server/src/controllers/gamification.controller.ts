import { Response, NextFunction } from "express";
import { gamificationService } from "../services/gamification.service.js";
import { badgesService } from "../services/badges.service.js"; // Importando o que criamos
import { AuthRequest } from "../middlewares/auth.js";

export const gamificationController = {
  /**
   * GET /api/gamification/streak
   * Retorna a sequência atual de dias do usuário
   */
  async getStreak(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const streak = await gamificationService.getStreak(req.user!.id);
      res.json(streak);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/badges
   * Lista o catálogo de medalhas com o status de desbloqueio
   */
  async getBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const badges = await badgesService.getForUser(userId);
      res.json(badges);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/badges/me
   * Retorna apenas as medalhas que o usuário já conquistou
   */
  async getMyBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const badges = await badgesService.getForUser(userId);
      
      // Filtra para enviar apenas as que estão desbloqueadas
      const unlockedOnly = badges.filter(b => b.unlocked);
      res.json(unlockedOnly);
    } catch (err) {
      next(err);
    }
  }
};
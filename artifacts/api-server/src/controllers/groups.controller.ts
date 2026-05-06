import { Response, NextFunction } from "express";
import { z } from "zod";
import { groupsService } from "../services/groups.service.js";
import { AuthRequest } from "../middlewares/auth.js";

const createSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const groupsController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const group = await groupsService.create(req.user!.id, parse.data);
      res.status(201).json(group);
    } catch (err) {
      next(err);
    }
  },

  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const groups = await groupsService.getMine(req.user!.id);
      res.json(groups);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.getById(req.params.id, req.user!.id);
      res.json(group);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const group = await groupsService.update(
        req.params.id,
        req.user!.id,
        parse.data,
      );
      res.json(group);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await groupsService.remove(req.params.id, req.user!.id);
      res.json({ success: true, message: "Grupo dissolvido" });
    } catch (err) {
      next(err);
    }
  },

  async joinByToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.joinByToken(
        req.params.inviteToken,
        req.user!.id,
      );
      res.json(group);
    } catch (err) {
      next(err);
    }
  },

  async leave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await groupsService.leave(req.params.id, req.user!.id);
      res.json({ success: true, message: "Você saiu do grupo" });
    } catch (err) {
      next(err);
    }
  },

  async kickMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await groupsService.kickMember(
        req.params.id,
        req.user!.id,
        req.params.userId,
      );
      res.json({ success: true, message: "Membro removido do grupo" });
    } catch (err) {
      next(err);
    }
  },
};

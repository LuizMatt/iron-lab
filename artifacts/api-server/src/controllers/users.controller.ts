import { Response, NextFunction } from "express";
import { z } from "zod";
import { usersService } from "../services/users.service.js";
import { AuthRequest } from "../middlewares/auth.js";
import { getParam } from "../lib/request-param.js";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["aluno", "professor", "admin"]).default("aluno"),
  phone: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const usersController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string | undefined;
      const users = await usersService.getAll(role);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    const id = getParam(req.params.id);
    if (req.user!.role === "aluno" && req.user!.id !== id) {
      res.status(403).json({ error: true, message: "Acesso negado" });
      return;
    }
    try {
      const user = await usersService.getById(id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const user = await usersService.create(parse.data);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    const id = getParam(req.params.id);
    if (req.user!.role === "aluno" && req.user!.id !== id) {
      res.status(403).json({ error: true, message: "Acesso negado" });
      return;
    }
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const user = await usersService.update(id, parse.data);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    const id = getParam(req.params.id);
    try {
      await usersService.delete(id);
      res.json({ success: true, message: "Usuário removido" });
    } catch (err) {
      next(err);
    }
  },
};

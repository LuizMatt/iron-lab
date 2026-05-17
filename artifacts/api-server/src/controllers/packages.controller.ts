import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { packagesService } from "../services/packages.service.js";
import { AuthRequest } from "../middlewares/auth.js";
import { getParam } from "../lib/request-param.js";

const createSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().min(1),
  price: z.number().int().nonnegative(),
  features: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  price: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

export const packagesController = {
  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      const packages = await packagesService.getActive();
      res.json(packages);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const packages = await packagesService.getAll();
      res.json(packages);
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
      const pkg = await packagesService.create(parse.data);
      res.status(201).json(pkg);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    const id = getParam(req.params.id);
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const pkg = await packagesService.update(id, parse.data);
      res.json(pkg);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    const id = getParam(req.params.id);
    try {
      await packagesService.remove(id);
      res.json({ success: true, message: "Pacote removido" });
    } catch (err) {
      next(err);
    }
  },
};

import { Response, NextFunction } from "express";
import { z } from "zod";
import { sliderImagesService } from "../services/slider-images.service.js";
import { AuthRequest } from "../middlewares/auth.js";

const createSchema = z.object({
  image_url: z.string().url(),
  mobile_image_url: z.string().url().nullable().optional(),
  alt_text: z.string().min(1),
  display_order: z.number().int(),
  is_active: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

export const sliderImagesController = {
  async getActive(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await sliderImagesService.getActive();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await sliderImagesService.getAll();
      res.json(data);
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
      const created = await sliderImagesService.create(parse.data);
      res.status(201).json(created);
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
    const updated = await sliderImagesService.update(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
      parse.data
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
  },

    async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        await sliderImagesService.remove(
        Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
        );
        res.json({ success: true, message: "Slide removido" });
    } catch (err) {
        next(err);
    }
    }
};
import { Response, NextFunction } from "express";
import { z } from "zod";
import { sliderImagesService } from "../services/slider-images.service.js";
import { AuthRequest } from "../middlewares/auth.js";

const createSchema = z.object({
  alt_text: z.string().min(1),
  display_order: z.coerce.number().int(),
  is_active: z.coerce.boolean().optional(),
});

const updateSchema = z.object({
  alt_text: z.string().min(1).optional(),
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().optional(),
});

function getUploadedPath(
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined,
  field: string
): string | undefined {
  if (!files || Array.isArray(files)) return undefined;
  const arr = files[field];
  if (!arr || arr.length === 0) return undefined;
  return `/uploads/sliderImages/${arr[0].filename}`;
}

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
    const image_url = getUploadedPath(req.files, "image");

    if (!image_url) {
      res.status(400).json({ error: true, message: "Campo 'image' é obrigatório no POST." });
      return;
    }

    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }

    const mobile_image_url = getUploadedPath(req.files, "mobile_image") ?? null;

    try {
      const created = await sliderImagesService.create({
        ...parse.data,
        image_url,
        mobile_image_url,
      });
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

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image_url = getUploadedPath(req.files, "image");
    const mobile_image_url = getUploadedPath(req.files, "mobile_image");

    try {
      const updated = await sliderImagesService.update(id, {
        ...parse.data,
        ...(image_url && { image_url }),
        ...(mobile_image_url && { mobile_image_url }),
      });
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
  },
};
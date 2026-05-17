import { Response, NextFunction } from "express";
import { z } from "zod";
import { checkinsService } from "../services/checkins.service.js";
import { AppError } from "../lib/app-error.js";
import { AuthRequest } from "../middlewares/auth.js";

interface UploadRequest extends AuthRequest {
  file?: Express.Multer.File;
}

const createSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255),
  duration_minutes: z.coerce.number().int().positive("Duração deve ser positiva"),
});

export const checkinsController = {
  async create(req: UploadRequest, res: Response, next: NextFunction) {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: true, message: "Foto é obrigatória" });
      return;
    }

    try {
      const photoUrl = `/uploads/${req.file.filename}`;
      const checkin = await checkinsService.create(req.user!.id, {
        title: parse.data.title,
        durationMinutes: parse.data.duration_minutes,
        photoUrl,
      });
      res.status(201).json(checkin);
    } catch (err) {
      next(err);
    }
  },

  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const checkins = await checkinsService.getMine(req.user!.id);
      res.json(checkins);
    } catch (err) {
      next(err);
    }
  },
};

export function multerErrorHandler(err: unknown, _req: AuthRequest, res: Response, next: NextFunction) {
  if (err instanceof Error) {
    if (err.message.includes("File too large")) {
      res.status(400).json({ error: true, message: "Arquivo muito grande. Máximo 5 MB." });
      return;
    }
    if (err.message.includes("Tipo de arquivo inválido")) {
      res.status(400).json({ error: true, message: err.message });
      return;
    }
  }
  next(err);
}

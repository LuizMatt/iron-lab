import { Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";
import { AuthRequest, COOKIE_OPTIONS } from "../middlewares/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: "Email e senha são obrigatórios" });
      return;
    }
    try {
      const result = await authService.login(parse.data.email, parse.data.password);
      res.cookie("ironlab_token", result.token, COOKIE_OPTIONS);
      res.json({ user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  logout(_req: AuthRequest, res: Response) {
    res.clearCookie("ironlab_token", { path: "/" });
    res.json({ success: true, message: "Sessão encerrada" });
  },
};

import { Response, NextFunction } from "express";
import { z } from "zod";
import { paymentsService } from "../services/payments.service.js";
import { AuthRequest } from "../middlewares/auth.js";

const generateSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
});

const webhookSchema = z.object({
  paymentId: z.string(),
});

export const paymentsController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        userId: req.query.userId as string | undefined,
      };
      const payments = await paymentsService.getForUser(req.user!.id, req.user!.role, filters);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  },

  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = generateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const payment = await paymentsService.generate(
        parse.data.userId,
        parse.data.amount,
        parse.data.dueDate,
      );
      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  },

  async webhook(req: AuthRequest, res: Response, next: NextFunction) {
    const parse = webhookSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: true, message: parse.error.message });
      return;
    }
    try {
      const payment = await paymentsService.confirmPayment(parse.data.paymentId);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  },
};

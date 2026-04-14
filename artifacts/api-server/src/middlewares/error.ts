import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/app-error.js";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: true, message: err.message });
    return;
  }

  req.log?.error({ err }, "Erro inesperado");
  res.status(500).json({ error: true, message: "Erro interno do servidor" });
}

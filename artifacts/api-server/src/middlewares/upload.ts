import multer, { FileFilterCallback } from "multer";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { Request } from "express";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "/app/uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = randomBytes(16).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo inválido. Use jpg, png ou webp."));
  }
}

export const uploadPhoto = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE_BYTES } });

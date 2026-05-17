import multer, { FileFilterCallback } from "multer";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { Request } from "express";
import { mkdirSync } from "node:fs";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const uploadsDir = process.env["UPLOADS_DIR"] || path.resolve(process.cwd(), "uploads");
const sliderUploadsDir = path.join(uploadsDir, "sliderImages");

// Garantir que os diretórios existam
mkdirSync(uploadsDir, { recursive: true });
mkdirSync(sliderUploadsDir, { recursive: true });

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo inválido. Use jpg, png ou webp."));
  }
}

// Upload genérico — foto de perfil, etc.
const genericStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = randomBytes(16).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

export const uploadPhoto = multer({
  storage: genericStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

// Upload específico para slider images
const sliderStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, sliderUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = randomBytes(16).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

export const sliderUpload = multer({
  storage: sliderStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "mobile_image", maxCount: 1 },
]);
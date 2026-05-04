import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { packagesController } from "../controllers/packages.controller.js";

const router = Router();

// Pública — sem autenticação
router.get("/", packagesController.getActive);

// Admin only
router.get("/all", authenticate, requireRole("admin"), packagesController.getAll);
router.post("/", authenticate, requireRole("admin"), packagesController.create);
router.put("/:id", authenticate, requireRole("admin"), packagesController.update);
router.delete("/:id", authenticate, requireRole("admin"), packagesController.remove);

export default router;

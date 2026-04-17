import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { gamificationController } from "../controllers/gamification.controller.js";

const router = Router();


router.use(authenticate);


router.get("/streak", gamificationController.getStreak);

// --- NOVAS ROTAS DE BADGES ---


router.get("/badges", gamificationController.getBadges);


router.get("/badges/me", gamificationController.getMyBadges);

export default router;
import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { authController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

export default router;

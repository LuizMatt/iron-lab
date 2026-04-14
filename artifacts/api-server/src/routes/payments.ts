import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { paymentsController } from "../controllers/payments.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", paymentsController.getAll);
router.post("/generate", requireRole("admin", "professor"), paymentsController.generate);
router.post("/webhook", paymentsController.webhook);

export default router;

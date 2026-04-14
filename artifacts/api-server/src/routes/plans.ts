import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { plansController } from "../controllers/plans.controller.js";

const router = Router();

router.use(authenticate);

router.get("/me", plansController.getMyPlan);

export default router;

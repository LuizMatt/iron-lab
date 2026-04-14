import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { workoutsController } from "../controllers/workouts.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", workoutsController.getAll);
router.post("/", workoutsController.create);
router.put("/:id", workoutsController.update);
router.delete("/:id", workoutsController.remove);
router.post("/:id/assign", requireRole("admin", "professor"), workoutsController.assign);
router.post("/:id/complete", workoutsController.complete);

export default router;

import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { usersController } from "../controllers/users.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", requireRole("admin", "professor"), usersController.getAll);
router.post("/", requireRole("admin", "professor"), usersController.create);
router.get("/:id", usersController.getById);
router.put("/:id", usersController.update);
router.delete("/:id", requireRole("admin"), usersController.remove);

export default router;

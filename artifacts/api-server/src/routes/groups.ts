import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { groupsController } from "../controllers/groups.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", groupsController.create);
router.get("/me", groupsController.getMine);
router.post("/join/:inviteToken", groupsController.joinByToken);

// Rotas com parâmetro :id
router.get("/:id", groupsController.getById);
router.patch("/:id", groupsController.update);
router.delete("/:id", groupsController.remove);
router.delete("/:id/leave", groupsController.leave);
router.delete("/:id/members/:userId", groupsController.kickMember);

export default router;

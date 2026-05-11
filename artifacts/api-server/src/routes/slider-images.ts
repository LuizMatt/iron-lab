import { Router } from "express";
import { sliderImagesController } from "../controllers/slider-images.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", sliderImagesController.getActive);

router.get("/all", authenticate, requireRole("admin"), sliderImagesController.getAll);
router.post("/", authenticate, requireRole("admin"), sliderImagesController.create);
router.put("/:id", authenticate, requireRole("admin"), sliderImagesController.update);
router.delete("/:id", authenticate, requireRole("admin"), sliderImagesController.remove);

export default router;
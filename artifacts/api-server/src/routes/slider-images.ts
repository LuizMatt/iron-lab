import { Router } from "express";
import { sliderImagesController } from "../controllers/slider-images.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { sliderUpload } from "../middlewares/upload.js";

const router = Router();

// público
router.get("/", sliderImagesController.getActive);

// admin
router.get("/all", authenticate, requireRole("admin"), sliderImagesController.getAll);
router.post("/", authenticate, requireRole("admin"), sliderUpload, sliderImagesController.create);
router.put("/:id", authenticate, requireRole("admin"), sliderUpload, sliderImagesController.update);
router.delete("/:id", authenticate, requireRole("admin"), sliderImagesController.remove);

export default router;
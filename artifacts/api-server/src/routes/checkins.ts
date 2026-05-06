import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { uploadPhoto } from "../middlewares/upload.js";
import { checkinsController, multerErrorHandler } from "../controllers/checkins.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", uploadPhoto.single("photo"), multerErrorHandler, checkinsController.create);
router.get("/me", checkinsController.getMine);

export default router;

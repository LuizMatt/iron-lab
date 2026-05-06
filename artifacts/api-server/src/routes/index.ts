import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import workoutsRouter from "./workouts.js";
import gamificationRouter from "./gamification.js";
import paymentsRouter from "./payments.js";
import plansRouter from "./plans.js";
import sliderImagesRoutes from "./slider-images.js";
import packagesRouter from "./packages.js";
import groupsRouter from "./groups.js";
import checkinsRouter from "./checkins.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/workouts", workoutsRouter);
router.use("/gamification", gamificationRouter);
router.use("/payments", paymentsRouter);
router.use("/plans", plansRouter);
router.use("/slider-images", sliderImagesRoutes);
router.use("/packages", packagesRouter);
router.use("/groups", groupsRouter);
router.use("/checkins", checkinsRouter);

export default router;

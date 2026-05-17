import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();
const healthCheckResponse = z.object({ status: z.literal("ok") });

router.get("/healthz", (_req, res) => {
  const data = healthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;

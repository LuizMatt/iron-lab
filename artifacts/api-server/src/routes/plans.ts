import { Router, IRouter } from "express";
import { db, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.use(authenticate);

router.get("/me", async (req: AuthRequest, res) => {
  try {
    const [plan] = await db.select().from(plansTable)
      .where(eq(plansTable.userId, req.user!.id))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "Nenhum plano encontrado" });
      return;
    }

    res.json({
      id: plan.id,
      userId: plan.userId,
      planName: plan.planName,
      price: parseFloat(plan.price as string),
      active: plan.active,
      nextDueDate: plan.nextDueDate,
    });
  } catch (err) {
    req.log.error({ err }, "Get plan error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

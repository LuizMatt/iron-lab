import { db, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";

export const plansService = {
  async getMyPlan(userId: string) {
    const [plan] = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.userId, userId))
      .limit(1);

    if (!plan) throw new AppError(404, "Nenhum plano encontrado");

    return {
      id: plan.id,
      userId: plan.userId,
      planName: plan.planName,
      price: parseFloat(plan.price as string),
      active: plan.active,
      nextDueDate: plan.nextDueDate,
    };
  },
};

import { Router, IRouter } from "express";
import { db, workoutLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.use(authenticate);

router.get("/streak", async (req: AuthRequest, res) => {
  try {
    const logs = await db.select().from(workoutLogsTable)
      .where(eq(workoutLogsTable.userId, req.user!.id));

    const uniqueDates = [...new Set(logs.map(l => l.completedAt))].sort();

    const today = new Date().toISOString().split("T")[0];
    const trainedToday = uniqueDates.includes(today);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    if (!trainedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      prevDate = d;
    }

    // Build week days (last 7 days, oldest to newest)
    const weekDays: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      weekDays.push(uniqueDates.includes(dateStr));
    }

    res.json({
      currentStreak,
      maxStreak,
      trainedToday,
      weekDays,
    });
  } catch (err) {
    req.log.error({ err }, "Streak error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

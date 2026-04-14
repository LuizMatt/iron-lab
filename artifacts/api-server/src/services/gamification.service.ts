import { db, workoutLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const gamificationService = {
  async getStreak(userId: string) {
    const logs = await db
      .select()
      .from(workoutLogsTable)
      .where(eq(workoutLogsTable.userId, userId));

    const uniqueDates = [...new Set(logs.map((l) => l.completedAt))].sort();
    const today = new Date().toISOString().split("T")[0];
    const trainedToday = uniqueDates.includes(today);

    let currentStreak = 0;
    const checkDate = new Date();
    if (!trainedToday) checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      prevDate = d;
    }

    const weekDays: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weekDays.push(uniqueDates.includes(d.toISOString().split("T")[0]));
    }

    return { currentStreak, maxStreak, trainedToday, weekDays };
  },
};

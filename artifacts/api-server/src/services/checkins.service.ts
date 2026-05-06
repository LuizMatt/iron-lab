import { db, workoutCheckinsTable, workoutLogsTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";

function currentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export const checkinsService = {
  async create(userId: string, data: { title: string; durationMinutes: number; photoUrl?: string }) {
    const [checkin] = await db
      .insert(workoutCheckinsTable)
      .values({ userId, ...data })
      .returning();

    // Registra em workout_logs para manter a streak do usuário
    // Usa um workout_id fictício reservado para check-ins livres
    const today = new Date();
    const completedAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    await db
      .insert(workoutLogsTable)
      .values({ userId, workoutId: "free-checkin", completedAt })
      .onConflictDoNothing();

    return checkin;
  },

  async getMine(userId: string) {
    const monthStart = currentMonthStart();

    return db
      .select()
      .from(workoutCheckinsTable)
      .where(
        and(
          eq(workoutCheckinsTable.userId, userId),
          gte(workoutCheckinsTable.checkedInAt, monthStart),
        ),
      );
  },
};

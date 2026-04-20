import { db, badgesTable, userBadgesTable, workoutLogsTable, type Badge, type UserBadge } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export const badgesService = {
  async getForUser(userId: string) {
    const allBadges = await db.select().from(badgesTable);
    const userBadges = await db
      .select()
      .from(userBadgesTable)
      .where(eq(userBadgesTable.userId, userId));

    const logs = await db
      .select()
      .from(workoutLogsTable)
      .where(eq(workoutLogsTable.userId, userId));

    return allBadges.map((badge: Badge) => {
      const unlocked = userBadges.find((ub: UserBadge) => ub.badgeId === badge.id);
      return {
        ...badge,
        unlocked: !!unlocked,
        unlocked_at: unlocked?.unlockedAt ?? null,
        progress: `${logs.length} treinos`,
      };
    });
  },

  async checkAndAward(userId: string) {
    const logs = await db
      .select()
      .from(workoutLogsTable)
      .where(eq(workoutLogsTable.userId, userId))
      .orderBy(sql`${workoutLogsTable.completedAt} DESC`);

    const totalWorkouts = logs.length;
    if (totalWorkouts === 0) return;

    const allBadges = await db.select().from(badgesTable);
    const userBadges = await db
      .select()
      .from(userBadgesTable)
      .where(eq(userBadgesTable.userId, userId));

    const ownedBadgeIds = new Set(userBadges.map((ub: UserBadge) => ub.badgeId));

    const award = async (key: string) => {
      const badge = allBadges.find((b: Badge) => b.key === key);
      if (badge && !ownedBadgeIds.has(badge.id)) {
        await db.insert(userBadgesTable).values({ userId, badgeId: badge.id });
      }
    };

    if (totalWorkouts >= 1) await award("first_workout");
    if (totalWorkouts >= 10) await award("workouts_10");
    if (totalWorkouts >= 50) await award("workouts_50");
    if (totalWorkouts >= 100) await award("workouts_100");

    let streak = 1;
    for (let i = 0; i < logs.length - 1; i++) {
      const current = new Date(logs[i].completedAt);
      const next = new Date(logs[i + 1].completedAt);
      const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) streak++;
      else if (diff > 1) break;
    }

    if (streak >= 3) await award("streak_3");
    if (streak >= 7) await award("streak_7");
    if (streak >= 14) await award("streak_14");
    if (streak >= 30) await award("streak_30");
  },
};
import {
  db,
  groupsTable,
  groupMembersTable,
  usersTable,
  workoutCheckinsTable,
} from "@workspace/db";
import { eq, and, gte, inArray, count } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";

import { generateInviteToken } from "../lib/invite-token.js";

const MAX_MEMBERS = 20;
const MAX_TOKEN_RETRIES = 5;

function currentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function isUniqueViolation(err: unknown) {
  return (err as { code?: string }).code === "23505";
}

async function insertGroupWithUniqueToken(data: {
  name: string;
  description?: string;
  ownerId: string;
}) {
  for (let i = 0; i < MAX_TOKEN_RETRIES; i++) {
    try {
      const [group] = await db
        .insert(groupsTable)
        .values({
          name: data.name,
          description: data.description,
          ownerId: data.ownerId,
          inviteToken: generateInviteToken(),
        })
        .returning();

      return group;
    } catch (err) {
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }

  throw new AppError(500, "Nao foi possivel gerar um convite unico");
}

export const groupsService = {
  async create(userId: string, data: { name: string; description?: string }) {
    const group = await insertGroupWithUniqueToken({ ...data, ownerId: userId });
    await db.insert(groupMembersTable).values({ groupId: group.id, userId });

    return group;
  },

  async getMine(userId: string) {
    const memberships = await db
      .select({ groupId: groupMembersTable.groupId })
      .from(groupMembersTable)
      .where(eq(groupMembersTable.userId, userId));

    if (memberships.length === 0) return [];

    const groupIds = memberships.map((m) => m.groupId);

    const groups = await db
      .select()
      .from(groupsTable)
      .where(inArray(groupsTable.id, groupIds));

    const counts = await db
      .select({
        groupId: groupMembersTable.groupId,
        count: count(),
      })
      .from(groupMembersTable)
      .where(inArray(groupMembersTable.groupId, groupIds))
      .groupBy(groupMembersTable.groupId);

    const countsMap = Object.fromEntries(
      counts.map((c) => [c.groupId, Number(c.count)]),
    );

    return groups.map((g) => ({
      ...g,
      memberCount: countsMap[g.id] ?? 0,
    }));
  },

  async getById(groupId: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo nao encontrado");

    const [membership] = await db
      .select({ id: groupMembersTable.id })
      .from(groupMembersTable)
      .where(
        and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) throw new AppError(403, "Voce nao e membro deste grupo");

    const members = await db
      .select({
        userId: groupMembersTable.userId,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: groupMembersTable.joinedAt,
      })
      .from(groupMembersTable)
      .innerJoin(usersTable, eq(groupMembersTable.userId, usersTable.id))
      .where(eq(groupMembersTable.groupId, groupId));

    const memberIds = members.map((m) => m.userId);
    const monthStart = currentMonthStart();
    const checkins = memberIds.length
      ? await db
          .select({
            userId: workoutCheckinsTable.userId,
            total: count(),
          })
          .from(workoutCheckinsTable)
          .where(
            and(
              inArray(workoutCheckinsTable.userId, memberIds),
              gte(workoutCheckinsTable.checkedInAt, monthStart),
            ),
          )
          .groupBy(workoutCheckinsTable.userId)
      : [];

    const checkinsMap = Object.fromEntries(
      checkins.map((c) => [c.userId, Number(c.total)]),
    );

    const ranking = members
      .map((m) => ({
        userId: m.userId,
        name: m.name,
        avatarUrl: m.avatarUrl,
        checkinsThisMonth: checkinsMap[m.userId] ?? 0,
      }))
      .sort((a, b) => b.checkinsThisMonth - a.checkinsThisMonth);

    return { ...group, members, ranking, memberCount: members.length };
  },

  async update(
    groupId: string,
    userId: string,
    data: { name?: string; description?: string },
  ) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo nao encontrado");
    if (group.ownerId !== userId)
      throw new AppError(403, "Apenas o dono pode editar o grupo");

    const [updated] = await db
      .update(groupsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groupsTable.id, groupId))
      .returning();

    return updated;
  },

  async remove(groupId: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo nao encontrado");
    if (group.ownerId !== userId)
      throw new AppError(403, "Apenas o dono pode dissolver o grupo");

    await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
  },

  async joinByToken(inviteToken: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.inviteToken, inviteToken))
      .limit(1);

    if (!group) throw new AppError(404, "Link de convite invalido");

    const members = await db
      .select()
      .from(groupMembersTable)
      .where(eq(groupMembersTable.groupId, group.id));

    if (members.some((m) => m.userId === userId))
      throw new AppError(400, "Voce ja e membro deste grupo");

    if (members.length >= MAX_MEMBERS)
      throw new AppError(400, "O grupo atingiu o limite de 20 membros");

    try {
      await db.insert(groupMembersTable).values({ groupId: group.id, userId });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new AppError(400, "Voce ja e membro deste grupo");
      throw err;
    }

    return group;
  },

  async leave(groupId: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo nao encontrado");
    if (group.ownerId === userId)
      throw new AppError(
        400,
        "O dono nao pode sair do grupo. Dissolva o grupo para encerra-lo.",
      );

    const [membership] = await db
      .select({ id: groupMembersTable.id })
      .from(groupMembersTable)
      .where(
        and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) throw new AppError(400, "Voce nao e membro deste grupo");

    await db
      .delete(groupMembersTable)
      .where(
        and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId),
        ),
      );
  },

  async kickMember(groupId: string, ownerId: string, targetUserId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo nao encontrado");
    if (group.ownerId !== ownerId)
      throw new AppError(403, "Apenas o dono pode expulsar membros");
    if (targetUserId === ownerId)
      throw new AppError(400, "O dono nao pode ser expulso do proprio grupo");

    await db
      .delete(groupMembersTable)
      .where(
        and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, targetUserId),
        ),
      );
  },
};

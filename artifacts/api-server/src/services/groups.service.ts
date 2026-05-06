import {
  db,
  groupsTable,
  groupMembersTable,
  usersTable,
  workoutLogsTable,
} from "@workspace/db";
import { eq, and, gte, inArray, count } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";
import { generateInviteToken } from "../lib/invite-token.js";

const MAX_MEMBERS = 20;
const MAX_TOKEN_RETRIES = 5;

/**
 * Retorna a data de início do mês corrente no formato YYYY-MM-DD.
 * Compatível com o campo completedAt de workout_logs (varchar YYYY-MM-DD).
 */
function currentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Gera um invite_token único, verificando colisões no banco.
 * Retorna em até MAX_TOKEN_RETRIES tentativas.
 */
async function resolveUniqueToken(): Promise<string> {
  for (let i = 0; i < MAX_TOKEN_RETRIES; i++) {
    const token = generateInviteToken();
    const [existing] = await db
      .select({ id: groupsTable.id })
      .from(groupsTable)
      .where(eq(groupsTable.inviteToken, token))
      .limit(1);
    if (!existing) return token;
  }
  // Fallback extremamente improvável: token base + sufixo de timestamp
  return generateInviteToken().slice(0, 6) + Date.now().toString(36).slice(-4);
}

export const groupsService = {
  /**
   * Cria um grupo e automaticamente adiciona o criador como membro.
   */
  async create(userId: string, data: { name: string; description?: string }) {
    const inviteToken = await resolveUniqueToken();

    const [group] = await db
      .insert(groupsTable)
      .values({
        name: data.name,
        description: data.description,
        ownerId: userId,
        inviteToken,
      })
      .returning();

    await db.insert(groupMembersTable).values({ groupId: group.id, userId });

    return group;
  },

  /**
   * Lista todos os grupos dos quais o usuário é membro.
   */
  async getMine(userId: string) {
    const memberships = await db
      .select({ groupId: groupMembersTable.groupId })
      .from(groupMembersTable)
      .where(eq(groupMembersTable.userId, userId));

    if (memberships.length === 0) return [];

    const groupIds = memberships.map((m) => m.groupId);

    return db
      .select()
      .from(groupsTable)
      .where(inArray(groupsTable.id, groupIds));
  },

  /**
   * Retorna detalhes do grupo com lista de membros e ranking do mês corrente.
   * O ranking é calculado on-the-fly a partir dos workout_logs existentes.
   */
  async getById(groupId: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo não encontrado");

    // Verificar se o usuário é membro para poder ver os detalhes
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

    if (!membership) throw new AppError(403, "Você não é membro deste grupo");

    // Buscar membros com dados do usuário
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

    // Calcular ranking do mês corrente via workout_logs
    let ranking: {
      userId: string;
      name: string;
      avatarUrl: string | null;
      checkinsThisMonth: number;
    }[] = [];

    if (memberIds.length > 0) {
      const monthStart = currentMonthStart();

      const checkins = await db
        .select({ userId: workoutLogsTable.userId, total: count() })
        .from(workoutLogsTable)
        .where(
          and(
            inArray(workoutLogsTable.userId, memberIds),
            gte(workoutLogsTable.completedAt, monthStart),
          ),
        )
        .groupBy(workoutLogsTable.userId);

      const checkinsMap = Object.fromEntries(
        checkins.map((c) => [c.userId, Number(c.total)]),
      );

      ranking = members
        .map((m) => ({
          userId: m.userId,
          name: m.name,
          avatarUrl: m.avatarUrl,
          checkinsThisMonth: checkinsMap[m.userId] ?? 0,
        }))
        .sort((a, b) => b.checkinsThisMonth - a.checkinsThisMonth);
    }

    return { ...group, members, ranking };
  },

  /**
   * Edita nome e/ou descrição. Apenas o owner pode editar.
   */
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

    if (!group) throw new AppError(404, "Grupo não encontrado");
    if (group.ownerId !== userId)
      throw new AppError(403, "Apenas o dono pode editar o grupo");

    const [updated] = await db
      .update(groupsTable)
      .set(data)
      .where(eq(groupsTable.id, groupId))
      .returning();

    return updated;
  },

  /**
   * Dissolve o grupo e todos os seus membros (cascade). Apenas o owner pode.
   */
  async remove(groupId: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo não encontrado");
    if (group.ownerId !== userId)
      throw new AppError(403, "Apenas o dono pode dissolver o grupo");

    await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
  },

  /**
   * Entra no grupo via invite_token. Valida limite de 20 membros e duplicidade.
   */
  async joinByToken(inviteToken: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.inviteToken, inviteToken))
      .limit(1);

    if (!group) throw new AppError(404, "Link de convite inválido");

    const members = await db
      .select()
      .from(groupMembersTable)
      .where(eq(groupMembersTable.groupId, group.id));

    if (members.some((m) => m.userId === userId))
      throw new AppError(400, "Você já é membro deste grupo");

    if (members.length >= MAX_MEMBERS)
      throw new AppError(400, "O grupo atingiu o limite de 20 membros");

    await db.insert(groupMembersTable).values({ groupId: group.id, userId });

    return group;
  },

  /**
   * Sai do grupo. O owner não pode sair (deve dissolver ou transferir).
   */
  async leave(groupId: string, userId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo não encontrado");
    if (group.ownerId === userId)
      throw new AppError(
        400,
        "O dono não pode sair do grupo. Dissolva o grupo para encerrá-lo.",
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

    if (!membership) throw new AppError(400, "Você não é membro deste grupo");

    await db
      .delete(groupMembersTable)
      .where(
        and(
          eq(groupMembersTable.groupId, groupId),
          eq(groupMembersTable.userId, userId),
        ),
      );
  },

  /**
   * Expulsa um membro do grupo. Apenas o owner pode expulsar.
   */
  async kickMember(groupId: string, ownerId: string, targetUserId: string) {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!group) throw new AppError(404, "Grupo não encontrado");
    if (group.ownerId !== ownerId)
      throw new AppError(403, "Apenas o dono pode expulsar membros");
    if (targetUserId === ownerId)
      throw new AppError(400, "O dono não pode ser expulso do próprio grupo");

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

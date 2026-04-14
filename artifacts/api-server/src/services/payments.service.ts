import { db, paymentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/app-error.js";

function formatPayment(
  payment: typeof paymentsTable.$inferSelect,
  userName?: string | null,
) {
  return {
    id: payment.id,
    userId: payment.userId,
    userName: userName ?? null,
    amount: parseFloat(payment.amount as string),
    status: payment.status,
    dueDate: payment.dueDate,
    paidAt: payment.paidAt,
    pixQrCode: payment.pixQrCode,
    pixCopyPaste: payment.pixCopyPaste,
    createdAt: payment.createdAt,
  };
}

function buildPixPayload(amount: number, userName: string) {
  return `PIX-IRONLAB-${amount.toFixed(2).replace(".", "")}-${userName.replace(/\s/g, "")}-${Date.now()}`;
}

export const paymentsService = {
  async getForUser(userId: string, role: string, filters?: { status?: string; userId?: string }) {
    if (role === "aluno") {
      const rows = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, userId));
      return rows.map((p) => formatPayment(p));
    }

    let rows = await db.select().from(paymentsTable);
    if (filters?.status) rows = rows.filter((p) => p.status === filters.status);
    if (filters?.userId) rows = rows.filter((p) => p.userId === filters.userId);

    const users = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    return rows.map((p) => formatPayment(p, usersMap[p.userId]));
  },

  async generate(userId: string, amount: number, dueDate: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) throw new AppError(404, "Usuário não encontrado");

    const pixPayload = buildPixPayload(amount, user.name);
    const pixQrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixPayload)}&size=200x200`;
    const pixCopyPaste = `00020126580014BR.GOV.BCB.PIX0136${pixPayload}5204000053039865802BR5925IRONLAB ACADEMIA LTDA6009SAO PAULO62070503***6304`;

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        userId,
        amount: amount.toFixed(2),
        status: "pending",
        dueDate,
        pixQrCode,
        pixCopyPaste,
      })
      .returning();

    return formatPayment(payment, user.name);
  },

  async confirmPayment(paymentId: string) {
    const [payment] = await db
      .update(paymentsTable)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(paymentsTable.id, paymentId))
      .returning();
    if (!payment) throw new AppError(404, "Pagamento não encontrado");
    return formatPayment(payment);
  },
};

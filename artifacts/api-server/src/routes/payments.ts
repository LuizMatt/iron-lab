import { Router, IRouter } from "express";
import { db, paymentsTable, plansTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(authenticate);

const generatePaymentSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
});

const webhookSchema = z.object({
  paymentId: z.string(),
});

function generatePixPayload(amount: number, name: string) {
  const payload = `PIX-IRONLAB-${amount.toFixed(2).replace(".", "")}-${name.replace(/\s/g, "")}-${Date.now()}`;
  return payload;
}

function formatPayment(payment: typeof paymentsTable.$inferSelect, userName?: string | null) {
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

router.get("/", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let payments;

    if (user.role === "aluno") {
      payments = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, user.id));
      res.json(payments.map(p => formatPayment(p)));
    } else {
      const status = req.query.status as string | undefined;
      const userId = req.query.userId as string | undefined;

      let allPayments = await db.select().from(paymentsTable);
      if (status) allPayments = allPayments.filter(p => p.status === status);
      if (userId) allPayments = allPayments.filter(p => p.userId === userId);

      const userIds = [...new Set(allPayments.map(p => p.userId))];
      let usersMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const users = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
        usersMap = Object.fromEntries(users.map(u => [u.id, u.name]));
      }

      res.json(allPayments.map(p => formatPayment(p, usersMap[p.userId])));
    }
  } catch (err) {
    req.log.error({ err }, "Get payments error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/generate", requireRole("admin", "professor"), async (req: AuthRequest, res) => {
  const parse = generatePaymentSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { userId, amount, dueDate } = parse.data;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const pixPayload = generatePixPayload(amount, user.name);
    const pixQrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixPayload)}&size=200x200`;
    const pixCopyPaste = `00020126580014BR.GOV.BCB.PIX0136${pixPayload}5204000053039865802BR5925IRONLAB ACADEMIA LTDA6009SAO PAULO62070503***6304`;

    const [payment] = await db.insert(paymentsTable).values({
      userId,
      amount: amount.toFixed(2),
      status: "pending",
      dueDate,
      pixQrCode,
      pixCopyPaste,
    }).returning();

    res.status(201).json(formatPayment(payment, user.name));
  } catch (err) {
    req.log.error({ err }, "Generate payment error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/webhook", async (req: AuthRequest, res) => {
  const parse = webhookSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { paymentId } = parse.data;

  try {
    const [payment] = await db.update(paymentsTable)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(paymentsTable.id, paymentId))
      .returning();

    if (!payment) {
      res.status(404).json({ error: "Pagamento não encontrado" });
      return;
    }

    res.json(formatPayment(payment));
  } catch (err) {
    req.log.error({ err }, "Payment webhook error");
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

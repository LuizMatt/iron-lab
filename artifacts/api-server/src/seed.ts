import bcrypt from "bcrypt";
import { db, usersTable, workoutsTable, exercisesTable, workoutAssignmentsTable, workoutLogsTable, paymentsTable, plansTable, packagesTable } from "@workspace/db";
import { logger } from "./lib/logger.js";

export async function seedIfEmpty() {
  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    logger.info("Database already seeded, skipping.");
    return;
  }

  logger.info("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 12);
  const profHash = await bcrypt.hash("prof123", 12);
  const alunoHash = await bcrypt.hash("aluno123", 12);

  // Create users
  const [admin] = await db.insert(usersTable).values({
    name: "Administrador",
    email: "admin@ironlab.com",
    passwordHash: adminHash,
    role: "admin",
    phone: "(11) 99999-0001",
  }).returning();

  const [professor] = await db.insert(usersTable).values({
    name: "Prof. Ricardo",
    email: "prof@ironlab.com",
    passwordHash: profHash,
    role: "professor",
    phone: "(11) 99999-0002",
  }).returning();

  const [aluno1] = await db.insert(usersTable).values({
    name: "Carlos Silva",
    email: "carlos@email.com",
    passwordHash: alunoHash,
    role: "aluno",
    phone: "(11) 98888-0001",
  }).returning();

  const [aluno2] = await db.insert(usersTable).values({
    name: "Ana Souza",
    email: "ana@email.com",
    passwordHash: alunoHash,
    role: "aluno",
    phone: "(11) 98888-0002",
  }).returning();

  // Create workouts
  const [workout1] = await db.insert(workoutsTable).values({
    name: "Treino A - Peito e Tríceps",
    description: "Foco em força e hipertrofia de peitoral e tríceps",
    muscleGroups: "Peito, Tríceps",
    createdBy: professor.id,
    isCustom: false,
  }).returning();

  await db.insert(exercisesTable).values([
    { workoutId: workout1.id, name: "Supino Reto com Barra", sets: 4, reps: "8-12", restSeconds: 90 },
    { workoutId: workout1.id, name: "Crucifixo Inclinado", sets: 3, reps: "10-15", restSeconds: 60 },
    { workoutId: workout1.id, name: "Tríceps Pulley", sets: 4, reps: "12-15", restSeconds: 60 },
    { workoutId: workout1.id, name: "Mergulho em Paralelas", sets: 3, reps: "10-12", restSeconds: 90 },
  ]);

  const [workout2] = await db.insert(workoutsTable).values({
    name: "Treino B - Costas e Bíceps",
    description: "Desenvolvimento de largura e espessura das costas",
    muscleGroups: "Costas, Bíceps",
    createdBy: professor.id,
    isCustom: false,
  }).returning();

  await db.insert(exercisesTable).values([
    { workoutId: workout2.id, name: "Puxada Alta Frente", sets: 4, reps: "8-12", restSeconds: 90 },
    { workoutId: workout2.id, name: "Remada Curvada com Barra", sets: 4, reps: "8-10", restSeconds: 90 },
    { workoutId: workout2.id, name: "Rosca Direta com Barra", sets: 3, reps: "10-12", restSeconds: 60 },
    { workoutId: workout2.id, name: "Rosca Martelo", sets: 3, reps: "10-12", restSeconds: 60 },
  ]);

  // Assign workouts to students
  await db.insert(workoutAssignmentsTable).values([
    { workoutId: workout1.id, userId: aluno1.id },
    { workoutId: workout2.id, userId: aluno1.id },
    { workoutId: workout1.id, userId: aluno2.id },
    { workoutId: workout2.id, userId: aluno2.id },
  ]);

  // Create workout logs for streak (last 7 days)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    await db.insert(workoutLogsTable).values({ userId: aluno1.id, workoutId: workout1.id, completedAt: dateStr });
  }
  // Ana has 3-day streak
  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    await db.insert(workoutLogsTable).values({ userId: aluno2.id, workoutId: workout1.id, completedAt: dateStr });
  }

  // Create plans
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextDueDate = nextMonth.toISOString().split("T")[0];

  await db.insert(plansTable).values([
    { userId: aluno1.id, planName: "Plano Mensal", price: "149.00", active: true, nextDueDate },
    { userId: aluno2.id, planName: "Plano Mensal", price: "149.00", active: true, nextDueDate },
  ]);

  // Create payment history
  const pixPayload1 = `PIX-IRONLAB-14900-CarlosSilva-${Date.now()}`;
  const pixQr1 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixPayload1)}&size=200x200`;

  for (let i = 4; i >= 1; i--) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() - i);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    await db.insert(paymentsTable).values({
      userId: aluno1.id,
      amount: "149.00",
      status: "paid",
      dueDate: dueDateStr,
      paidAt: new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      pixQrCode: pixQr1,
      pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136${pixPayload1}5204000053039865802BR5925IRONLAB ACADEMIA LTDA6009SAO PAULO62070503***6304`,
    });
  }

  // Pending payment for current month
  await db.insert(paymentsTable).values({
    userId: aluno1.id,
    amount: "149.00",
    status: "pending",
    dueDate: nextDueDate,
    pixQrCode: pixQr1,
    pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136${pixPayload1}5204000053039865802BR5925IRONLAB ACADEMIA LTDA6009SAO PAULO62070503***6304`,
  });

  const pixPayload2 = `PIX-IRONLAB-14900-AnaSouza-${Date.now()}`;
  const pixQr2 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixPayload2)}&size=200x200`;
  for (let i = 4; i >= 1; i--) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() - i);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    await db.insert(paymentsTable).values({
      userId: aluno2.id,
      amount: "149.00",
      status: "paid",
      dueDate: dueDateStr,
      paidAt: new Date(dueDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      pixQrCode: pixQr2,
      pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136${pixPayload2}5204000053039865802BR5925IRONLAB ACADEMIA LTDA6009SAO PAULO62070503***6304`,
    });
  }

  await db.insert(packagesTable).values([
    {
      name: "Básico",
      subtitle: "Para quem está começando",
      price: 9900,
      features: ["Acesso à academia", "Vestiário", "Musculação"],
      is_featured: false,
      is_active: true,
      display_order: 1,
    },
    {
      name: "Pro",
      subtitle: "Para quem é sério",
      price: 19900,
      features: ["Tudo do Básico", "Aulas em grupo", "Avaliação física mensal", "App de treinos"],
      is_featured: true,
      is_active: true,
      display_order: 2,
    },
    {
      name: "Elite",
      subtitle: "Experiência completa",
      price: 34900,
      features: ["Tudo do Pro", "Personal trainer", "Nutricionista", "Acesso 24h", "Área VIP"],
      is_featured: false,
      is_active: true,
      display_order: 3,
    },
  ]).catch((err) => logger.error({ err }, "Failed to seed packages"));

  logger.info("Database seeded successfully!");
  logger.info("Credentials: admin@ironlab.com/admin123, prof@ironlab.com/prof123, carlos@email.com/aluno123, ana@email.com/aluno123");
}

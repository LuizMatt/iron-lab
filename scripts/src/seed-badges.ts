import { db } from "../../lib/db/src";
import { badgesTable } from "../../lib/db/src/schema/badges";

async function seed() {
  console.log("🌱 Populando catálogo de badges...");

  const badges = [
    { key: "first_workout", name: "Primeiro Suor", criteria: "1 treino concluído" },
    { key: "streak_3", name: "Trinca", criteria: "3 dias consecutivos" },
    { key: "streak_7", name: "Semana de Ferro", criteria: "7 dias consecutivos" },
    { key: "streak_14", name: "Quinzena Brutal", criteria: "14 dias consecutivos" },
    { key: "streak_30", name: "Mês de Aço", criteria: "30 dias consecutivos" },
    { key: "workouts_10", name: "Dez no Relógio", criteria: "10 treinos no total" },
    { key: "workouts_50", name: "Cinquenta Pesado", criteria: "50 treinos no total" },
    { key: "workouts_100", name: "Centurião", criteria: "100 treinos no total" },
  ];

  for (const badge of badges) {
    await db.insert(badgesTable).values(badge).onConflictDoNothing();
  }

  console.log("✅ Catálogo de badges pronto!");
  process.exit(0);
}

seed();
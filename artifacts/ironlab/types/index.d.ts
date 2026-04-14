declare interface User {
  id: string;
  name: string;
  email: string;
  role: "aluno" | "professor" | "admin";
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt: string;
}

declare interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number | null;
}

declare interface Workout {
  id: string;
  name: string;
  description?: string | null;
  muscleGroups?: string | null;
  createdBy?: string | null;
  isCustom: boolean;
  createdAt: string;
  exercises: Exercise[];
}

declare interface Payment {
  id: string;
  userId: string;
  userName?: string | null;
  amount: number;
  status: "pending" | "paid";
  dueDate: string;
  paidAt?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  createdAt: string;
}

declare interface Plan {
  id: string;
  userId: string;
  planName: string;
  price: number;
  active: boolean;
  nextDueDate?: string | null;
}

declare interface StreakData {
  currentStreak: number;
  maxStreak: number;
  trainedToday: boolean;
  weekDays: boolean[];
}

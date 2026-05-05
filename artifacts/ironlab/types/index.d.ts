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

declare interface Package {
  id: string;
  name: string;
  subtitle?: string | null;
  price: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  features: string[];
  createdAt?: string;
}

declare interface SliderImage {
  id: string;
  image_url: string;
  mobile_image_url?: string | null;
  alt_text?: string | null;
  display_order: number;
  is_active: boolean;
  createdAt?: string;
}
<template>
  <div class="min-h-screen bg-[#0d0d0d] flex">
    <!-- Sidebar -->
    <aside class="w-64 shrink-0 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col min-h-screen">
      <div class="p-6 border-b border-[#1a1a1a]">
        <span class="font-display text-3xl text-[#a3e635] tracking-widest">IRONLAB</span>
      </div>

      <!-- User info -->
      <div class="p-4 border-b border-[#1a1a1a]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#a3e635]/20 flex items-center justify-center shrink-0">
            <span class="text-[#a3e635] font-bold text-sm">
              {{ auth.user.value?.name?.charAt(0) }}
            </span>
          </div>
          <div class="min-w-0">
            <p class="text-[#f5f5f5] font-medium text-sm truncate">{{ auth.user.value?.name }}</p>
            <p class="text-[#737373] text-xs">Aluno</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-4 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.key"
          @click="activeTab = item.key"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === item.key
              ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20'
              : 'text-[#737373] hover:text-[#f5f5f5] hover:bg-[#141414]'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </button>
      </nav>

      <div class="p-4 border-t border-[#1a1a1a]">
        <button
          @click="auth.logout()"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#737373] hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut class="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8 overflow-auto">
      <!-- Treinos tab -->
      <div v-if="activeTab === 'treinos'">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-display text-4xl text-white">MEUS TREINOS</h1>
            <p class="text-[#737373] text-sm mt-1">Treinos atribuídos pelo seu professor</p>
          </div>
          <button
            @click="showCreateWorkout = true"
            class="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors"
          >
            <Plus class="w-4 h-4" />
            Criar Treino
          </button>
        </div>

        <div v-if="loadingWorkouts" class="text-center py-16 text-[#737373]">
          <Loader2 class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
          Carregando treinos...
        </div>

        <div v-else-if="workouts.length === 0" class="text-center py-16 bg-[#141414] border border-[#262626] rounded-xl">
          <Dumbbell class="w-12 h-12 mx-auto mb-4 text-[#737373]" />
          <p class="text-[#737373]">Nenhum treino encontrado.</p>
          <p class="text-[#555] text-sm mt-1">Aguarde seu professor atribuir treinos ou crie o seu.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="workout in workouts"
            :key="workout.id"
            class="bg-[#141414] border border-[#262626] rounded-xl p-6 hover:border-[#333] transition-colors"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-white font-semibold">{{ workout.name }}</h3>
                  <span v-if="workout.isCustom" class="text-[10px] px-2 py-0.5 bg-[#a3e635]/10 text-[#a3e635] rounded-full border border-[#a3e635]/20">
                    Personalizado
                  </span>
                </div>
                <p v-if="workout.muscleGroups" class="text-[#737373] text-xs">
                  {{ workout.muscleGroups }}
                </p>
              </div>
              <button
                @click="completeWorkout(workout.id)"
                :disabled="completingId === workout.id"
                class="flex items-center gap-2 px-4 py-2 bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 rounded-lg text-xs font-semibold hover:bg-[#a3e635]/20 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ completingId === workout.id ? "Salvando..." : "Concluir" }}
              </button>
            </div>
            <div class="border-t border-[#262626] pt-4">
              <p class="text-[#737373] text-xs font-medium mb-3 uppercase tracking-wider">Exercícios</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="ex in workout.exercises"
                  :key="ex.id"
                  class="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-3 py-2"
                >
                  <span class="text-sm text-[#f5f5f5]">{{ ex.name }}</span>
                  <span class="text-xs text-[#737373]">{{ ex.sets }}x{{ ex.reps }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Streak tab -->
      <div v-if="activeTab === 'streak'">
        <h1 class="font-display text-4xl text-white mb-8">SEQUÊNCIA DE TREINOS</h1>

        <div v-if="loadingStreak" class="text-center py-16 text-[#737373]">
          <Loader2 class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
        </div>

        <div v-else-if="streak" class="space-y-6">
          <!-- Main streak cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 text-center">
              <Flame class="w-8 h-8 text-[#a3e635] mx-auto mb-4" />
              <div class="font-display text-6xl text-[#a3e635]">{{ streak.currentStreak }}</div>
              <p class="text-[#737373] text-sm mt-2">Sequência atual</p>
            </div>
            <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 text-center">
              <Trophy class="w-8 h-8 text-yellow-500 mx-auto mb-4" />
              <div class="font-display text-6xl text-white">{{ streak.maxStreak }}</div>
              <p class="text-[#737373] text-sm mt-2">Recorde pessoal</p>
            </div>
            <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 text-center">
              <CheckCircle2
                class="w-8 h-8 mx-auto mb-4"
                :class="streak.trainedToday ? 'text-[#a3e635]' : 'text-[#737373]'"
              />
              <div
                class="font-display text-2xl"
                :class="streak.trainedToday ? 'text-[#a3e635]' : 'text-[#737373]'"
              >
                {{ streak.trainedToday ? "TREINOU!" : "PENDENTE" }}
              </div>
              <p class="text-[#737373] text-sm mt-2">Hoje</p>
            </div>
          </div>

          <!-- Week view -->
          <div class="bg-[#141414] border border-[#262626] rounded-xl p-6">
            <p class="text-[#737373] text-xs font-medium uppercase tracking-wider mb-6">
              Últimos 7 dias
            </p>
            <div class="flex items-center justify-between gap-2">
              <div
                v-for="(trained, i) in streak.weekDays"
                :key="i"
                class="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    trained
                      ? 'bg-[#a3e635] text-[#0d0d0d]'
                      : 'bg-[#1a1a1a] border border-[#262626] text-[#555]'
                  ]"
                >
                  {{ weekDayLabels[i] }}
                </div>
                <Flame v-if="trained" class="w-3 h-3 text-[#a3e635]" />
                <div v-else class="w-3 h-3" />
              </div>
            </div>
          </div>

          <!-- Motivation -->
          <div
            v-if="streak.currentStreak > 0"
            class="bg-[#a3e635]/5 border border-[#a3e635]/20 rounded-xl p-6 text-center"
          >
            <p class="text-[#a3e635] font-semibold">
              {{ streakMotivation }}
            </p>
          </div>
        </div>
      </div>

      <!-- Financeiro tab -->
      <div v-if="activeTab === 'financeiro'">
        <h1 class="font-display text-4xl text-white mb-8">FINANCEIRO</h1>

        <!-- Plan -->
        <div v-if="plan" class="bg-[#141414] border border-[#262626] rounded-xl p-6 mb-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[#737373] text-xs uppercase tracking-wider mb-1">Plano atual</p>
              <h3 class="text-white font-semibold text-lg">{{ plan.planName }}</h3>
            </div>
            <div class="text-right">
              <p class="font-display text-3xl text-[#a3e635]">
                R$ {{ plan.price.toFixed(2).replace(".", ",") }}
              </p>
              <p class="text-[#737373] text-xs">
                Próximo vencimento: {{ plan.nextDueDate || "—" }}
              </p>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                plan.active ? 'bg-[#a3e635]' : 'bg-[#737373]'
              ]"
            />
            <span class="text-xs text-[#737373]">
              {{ plan.active ? "Plano ativo" : "Plano inativo" }}
            </span>
          </div>
        </div>

        <!-- Payments -->
        <div class="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <div class="p-6 border-b border-[#262626]">
            <h3 class="font-display text-2xl text-white">HISTÓRICO DE PAGAMENTOS</h3>
          </div>

          <div v-if="loadingPayments" class="p-8 text-center text-[#737373]">
            <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-[#a3e635]" />
          </div>

          <div v-else-if="payments.length === 0" class="p-8 text-center text-[#737373]">
            Nenhum pagamento encontrado.
          </div>

          <table v-else class="w-full">
            <thead class="bg-[#1a1a1a]">
              <tr>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Vencimento</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Valor</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Status</th>
                <th class="text-left text-xs text-[#737373] uppercase tracking-wider px-6 py-3">Pix</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262626]">
              <tr v-for="payment in payments" :key="payment.id" class="hover:bg-[#1a1a1a] transition-colors">
                <td class="px-6 py-4 text-sm text-[#f5f5f5]">{{ payment.dueDate }}</td>
                <td class="px-6 py-4 text-sm text-[#f5f5f5]">
                  R$ {{ payment.amount.toFixed(2).replace(".", ",") }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full font-medium',
                      payment.status === 'paid'
                        ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    ]"
                  >
                    {{ payment.status === "paid" ? "Pago" : "Pendente" }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button
                    v-if="payment.status === 'pending' && payment.pixQrCode"
                    @click="selectedPayment = payment"
                    class="text-xs text-[#a3e635] hover:underline"
                  >
                    Ver Pix
                  </button>
                  <span v-else class="text-[#555] text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Perfil tab -->
      <div v-if="activeTab === 'perfil'">
        <h1 class="font-display text-4xl text-white mb-8">MEU PERFIL</h1>

        <div class="max-w-md bg-[#141414] border border-[#262626] rounded-xl p-8">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-16 h-16 rounded-full bg-[#a3e635]/20 flex items-center justify-center">
              <span class="font-display text-3xl text-[#a3e635]">
                {{ auth.user.value?.name?.charAt(0) }}
              </span>
            </div>
            <div>
              <h3 class="text-white font-semibold">{{ auth.user.value?.name }}</h3>
              <p class="text-[#737373] text-sm capitalize">{{ auth.user.value?.role }}</p>
            </div>
          </div>

          <form @submit.prevent="updateProfile" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-[#f5f5f5] mb-2">Nome</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#f5f5f5] mb-2">E-mail</label>
              <input
                v-model="profileForm.email"
                type="email"
                class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#f5f5f5] mb-2">Telefone</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                placeholder="(11) 99999-9999"
                class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors"
              />
            </div>

            <div v-if="profileMessage" class="text-xs py-2 px-3 rounded-lg"
              :class="profileMessage.type === 'success'
                ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'"
            >
              {{ profileMessage.text }}
            </div>

            <button
              type="submit"
              :disabled="savingProfile"
              class="w-full bg-[#a3e635] text-[#0d0d0d] font-bold py-3 rounded-lg hover:bg-[#bef264] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Loader2 v-if="savingProfile" class="w-4 h-4 animate-spin" />
              {{ savingProfile ? "Salvando..." : "Salvar alterações" }}
            </button>
          </form>
        </div>
      </div>
    </main>

    <!-- Pix Modal -->
    <Teleport to="body">
      <div
        v-if="selectedPayment"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        @click.self="selectedPayment = null"
      >
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-sm w-full">
          <h3 class="font-display text-2xl text-white mb-6 text-center">PAGAR VIA PIX</h3>
          <div class="text-center mb-6">
            <p class="text-[#737373] text-xs mb-4">QR Code</p>
            <img
              :src="selectedPayment.pixQrCode || ''"
              alt="QR Code Pix"
              class="mx-auto rounded-lg border border-[#262626] w-40 h-40 bg-white p-1"
            />
          </div>
          <div class="mb-6">
            <p class="text-[#737373] text-xs mb-2">Pix copia e cola</p>
            <div class="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3">
              <p class="text-[#f5f5f5] text-xs break-all">{{ selectedPayment.pixCopyPaste }}</p>
            </div>
          </div>
          <p class="text-center text-[#a3e635] font-display text-3xl mb-6">
            R$ {{ selectedPayment.amount.toFixed(2).replace(".", ",") }}
          </p>
          <button
            @click="selectedPayment = null"
            class="w-full border border-[#262626] text-[#f5f5f5] py-3 rounded-lg hover:border-[#a3e635]/30 transition-colors text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Create workout modal -->
    <Teleport to="body">
      <div
        v-if="showCreateWorkout"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        @click.self="showCreateWorkout = false"
      >
        <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h3 class="font-display text-2xl text-white mb-6">CRIAR TREINO PERSONALIZADO</h3>
          <form @submit.prevent="createWorkout" class="space-y-4">
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Nome do treino</label>
              <input
                v-model="newWorkout.name"
                required
                class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm text-[#f5f5f5] mb-2">Grupos musculares</label>
              <input
                v-model="newWorkout.muscleGroups"
                placeholder="Ex: Peito, Tríceps"
                class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm outline-none focus:border-[#a3e635] transition-colors"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm text-[#f5f5f5]">Exercícios</label>
                <button
                  type="button"
                  @click="addExercise"
                  class="text-xs text-[#a3e635] hover:underline"
                >
                  + Adicionar
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(ex, i) in newWorkout.exercises"
                  :key="i"
                  class="grid grid-cols-3 gap-2 bg-[#1a1a1a] p-3 rounded-lg"
                >
                  <input
                    v-model="ex.name"
                    placeholder="Exercício"
                    required
                    class="col-span-3 bg-[#262626] border border-[#333] rounded px-3 py-2 text-[#f5f5f5] text-xs outline-none focus:border-[#a3e635]"
                  />
                  <input
                    v-model.number="ex.sets"
                    placeholder="Séries"
                    type="number"
                    min="1"
                    required
                    class="bg-[#262626] border border-[#333] rounded px-3 py-2 text-[#f5f5f5] text-xs outline-none focus:border-[#a3e635]"
                  />
                  <input
                    v-model="ex.reps"
                    placeholder="Reps"
                    required
                    class="bg-[#262626] border border-[#333] rounded px-3 py-2 text-[#f5f5f5] text-xs outline-none focus:border-[#a3e635]"
                  />
                  <button
                    v-if="newWorkout.exercises.length > 1"
                    type="button"
                    @click="newWorkout.exercises.splice(i, 1)"
                    class="text-red-400 text-xs hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showCreateWorkout = false"
                class="flex-1 border border-[#262626] text-[#f5f5f5] py-3 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="savingWorkout"
                class="flex-1 bg-[#a3e635] text-[#0d0d0d] py-3 rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors disabled:opacity-60"
              >
                {{ savingWorkout ? "Salvando..." : "Criar Treino" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  Dumbbell,
  Flame,
  CreditCard,
  User,
  LogOut,
  CheckCircle2,
  Plus,
  Loader2,
  Trophy,
} from "lucide-vue-next";

definePageMeta({ middleware: "auth" });

const auth = useAuth();
const api = useApi();

const activeTab = ref<"treinos" | "streak" | "financeiro" | "perfil">("treinos");

const navItems = [
  { key: "treinos", label: "Treinos", icon: Dumbbell },
  { key: "streak", label: "Sequência", icon: Flame },
  { key: "financeiro", label: "Financeiro", icon: CreditCard },
  { key: "perfil", label: "Perfil", icon: User },
];

// --- Treinos ---
const workouts = ref<Workout[]>([]);
const loadingWorkouts = ref(true);
const completingId = ref("");
const showCreateWorkout = ref(false);
const savingWorkout = ref(false);

const newWorkout = reactive({
  name: "",
  muscleGroups: "",
  exercises: [{ name: "", sets: 3, reps: "12" }],
});

const addExercise = () => newWorkout.exercises.push({ name: "", sets: 3, reps: "12" });

const fetchWorkouts = async () => {
  loadingWorkouts.value = true;
  try {
    workouts.value = await api.get<Workout[]>("/workouts");
  } catch {}
  loadingWorkouts.value = false;
};

const completeWorkout = async (id: string) => {
  completingId.value = id;
  try {
    await api.post(`/workouts/${id}/complete`);
    await fetchStreak();
  } catch {}
  completingId.value = "";
};

const createWorkout = async () => {
  savingWorkout.value = true;
  try {
    const created = await api.post<Workout>("/workouts", {
      name: newWorkout.name,
      muscleGroups: newWorkout.muscleGroups || undefined,
      isCustom: true,
      exercises: newWorkout.exercises,
    });
    workouts.value.unshift(created);
    showCreateWorkout.value = false;
    Object.assign(newWorkout, {
      name: "",
      muscleGroups: "",
      exercises: [{ name: "", sets: 3, reps: "12" }],
    });
  } catch {}
  savingWorkout.value = false;
};

// --- Streak ---
const streak = ref<StreakData | null>(null);
const loadingStreak = ref(false);
const weekDayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

const streakMotivation = computed(() => {
  const s = streak.value?.currentStreak ?? 0;
  if (s >= 30) return "Incrível! 30 dias de pura dedicação!";
  if (s >= 14) return "Duas semanas seguidas! Você é imparável!";
  if (s >= 7) return "Uma semana completa! Continue assim!";
  if (s >= 3) return "3 dias seguidos! A disciplina está chegando!";
  return "Continue treinando para manter sua sequência!";
});

const fetchStreak = async () => {
  loadingStreak.value = true;
  try {
    streak.value = await api.get<StreakData>("/gamification/streak");
  } catch {}
  loadingStreak.value = false;
};

// --- Financeiro ---
const payments = ref<Payment[]>([]);
const loadingPayments = ref(false);
const plan = ref<Plan | null>(null);
const selectedPayment = ref<Payment | null>(null);

const fetchFinanceiro = async () => {
  loadingPayments.value = true;
  try {
    const [paymentsData, planData] = await Promise.allSettled([
      api.get<Payment[]>("/payments"),
      api.get<Plan>("/plans/me"),
    ]);
    if (paymentsData.status === "fulfilled") payments.value = paymentsData.value;
    if (planData.status === "fulfilled") plan.value = planData.value;
  } finally {
    loadingPayments.value = false;
  }
};

// --- Perfil ---
const profileForm = reactive({ name: "", email: "", phone: "" });
const savingProfile = ref(false);
const profileMessage = ref<{ type: "success" | "error"; text: string } | null>(null);

const updateProfile = async () => {
  savingProfile.value = true;
  profileMessage.value = null;
  try {
    const updated = await api.put<User>(`/users/${auth.user.value!.id}`, profileForm);
    auth.user.value = updated;
    profileMessage.value = { type: "success", text: "Perfil atualizado com sucesso!" };
  } catch (err: unknown) {
    profileMessage.value = {
      type: "error",
      text: (err as Error).message || "Erro ao atualizar perfil",
    };
  }
  savingProfile.value = false;
};

// --- Watchers ---
watch(activeTab, async (tab) => {
  if (tab === "treinos" && workouts.value.length === 0) await fetchWorkouts();
  if (tab === "streak" && !streak.value) await fetchStreak();
  if (tab === "financeiro" && payments.value.length === 0) await fetchFinanceiro();
  if (tab === "perfil" && auth.user.value) {
    profileForm.name = auth.user.value.name ?? "";
    profileForm.email = auth.user.value.email ?? "";
    profileForm.phone = auth.user.value.phone ?? "";
  }
});

onMounted(async () => {
  await fetchWorkouts();
  if (auth.user.value) {
    profileForm.name = auth.user.value.name ?? "";
    profileForm.email = auth.user.value.email ?? "";
    profileForm.phone = auth.user.value.phone ?? "";
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0d]">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-[#0d0d0d]/90 backdrop-blur-sm">
      <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <span class="font-display text-3xl text-[#a3e635] tracking-widest">IRONLAB</span>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/login"
            class="px-5 py-2 rounded bg-[#a3e635] text-[#0d0d0d] font-semibold text-sm hover:bg-[#bef264] transition-colors"
          >
            Entrar
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="pt-32 pb-24 px-6">
      <div class="mx-auto max-w-4xl text-center">
        <div class="inline-block px-3 py-1 rounded-full border border-[#a3e635]/30 text-[#a3e635] text-xs font-semibold mb-6 tracking-widest uppercase">
          Academia Premium
        </div>
        <h1 class="font-display text-7xl md:text-9xl text-white leading-none mb-6">
          FORJE SEU<br />
          <span class="text-[#a3e635]">LIMITE</span>
        </h1>
        <p class="text-[#737373] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Treinos personalizados, acompanhamento de evolução e gestão financeira integrada.
          Tudo que você precisa para chegar ao próximo nível.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/login"
            class="px-8 py-4 rounded bg-[#a3e635] text-[#0d0d0d] font-bold text-sm hover:bg-[#bef264] transition-all hover:scale-105"
          >
            COMEÇAR AGORA
          </NuxtLink>
          <a
            href="#planos"
            class="px-8 py-4 rounded border border-[#262626] text-[#f5f5f5] font-bold text-sm hover:border-[#a3e635]/50 transition-colors"
          >
            VER PLANOS
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-24 px-6 border-t border-[#1a1a1a]">
      <div class="mx-auto max-w-6xl">
        <h2 class="font-display text-5xl text-center text-white mb-4">POR QUE IRONLAB?</h2>
        <p class="text-[#737373] text-center mb-16 max-w-xl mx-auto">
          Uma plataforma completa pensada para transformar sua rotina de treinos.
        </p>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-8 rounded-xl border border-[#262626] bg-[#141414] hover:border-[#a3e635]/30 transition-colors"
          >
            <div class="w-12 h-12 rounded-lg bg-[#a3e635]/10 flex items-center justify-center mb-6">
              <component :is="feature.icon" class="w-6 h-6 text-[#a3e635]" />
            </div>
            <h3 class="font-display text-2xl text-white mb-3">{{ feature.title }}</h3>
            <p class="text-[#737373] text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-20 px-6 bg-[#141414] border-y border-[#262626]">
      <div class="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="stat in stats" :key="stat.label">
          <div class="font-display text-5xl text-[#a3e635]">{{ stat.value }}</div>
          <div class="text-[#737373] text-sm mt-2">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Planos — dinâmico -->
    <section v-if="loadingPackages || activePackages.length > 0" id="planos" class="py-24 px-6">
      <div class="mx-auto max-w-4xl">
        <h2 class="font-display text-5xl text-center text-white mb-4">ESCOLHA SEU PLANO</h2>
        <p class="text-[#737373] text-center mb-16">Sem surpresas. Cancele quando quiser.</p>

        <!-- Skeleton -->
        <div v-if="loadingPackages" class="grid md:grid-cols-2 gap-6">
          <div
            v-for="n in 2"
            :key="n"
            class="p-8 rounded-xl border border-[#262626] bg-[#141414] animate-pulse"
          >
            <div class="h-8 bg-[#262626] rounded w-1/3 mb-4"></div>
            <div class="h-12 bg-[#262626] rounded w-1/2 mb-6"></div>
            <div class="space-y-3 mb-8">
              <div v-for="i in 4" :key="i" class="h-4 bg-[#262626] rounded w-full"></div>
            </div>
            <div class="h-10 bg-[#262626] rounded w-full"></div>
          </div>
        </div>

        <!-- Cards dinâmicos -->
        <div v-else class="grid md:grid-cols-2 gap-6">
          <div
            v-for="pkg in activePackages"
            :key="pkg.id"
            :class="[
              'p-8 rounded-xl border transition-all relative',
              pkg.is_featured
                ? 'border-[#a3e635] bg-[#141414]'
                : 'border-[#262626] bg-[#0d0d0d]'
            ]"
          >
            <div v-if="pkg.is_featured" class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="bg-[#a3e635] text-[#0d0d0d] text-xs font-bold px-4 py-1 rounded-full">
                MAIS POPULAR
              </span>
            </div>
            <h3 class="font-display text-3xl text-white mb-1">{{ pkg.name }}</h3>
            <p v-if="pkg.subtitle" class="text-[#737373] text-sm mb-4">{{ pkg.subtitle }}</p>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-[#737373] text-sm">R$</span>
              <span class="font-display text-5xl text-[#a3e635]">
                {{ Number(pkg.price).toFixed(2).replace(".", ",") }}
              </span>
              <span class="text-[#737373] text-sm">/mês</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li
                v-for="item in pkg.features"
                :key="item"
                class="flex items-center gap-3 text-sm text-[#f5f5f5]"
              >
                <CheckCircle2 class="w-4 h-4 text-[#a3e635] shrink-0" />
                {{ item }}
              </li>
            </ul>
            <NuxtLink
              to="/login"
              :class="[
                'block text-center py-3 rounded font-semibold text-sm transition-all',
                pkg.is_featured
                  ? 'bg-[#a3e635] text-[#0d0d0d] hover:bg-[#bef264]'
                  : 'border border-[#262626] text-[#f5f5f5] hover:border-[#a3e635]/50'
              ]"
            >
              ASSINAR AGORA
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-[#1a1a1a] py-10 px-6 text-center">
      <span class="font-display text-2xl text-[#a3e635]">IRONLAB</span>
      <p class="text-[#737373] text-xs mt-2">
        &copy; {{ new Date().getFullYear() }} IRONLAB Academia. Todos os direitos reservados.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Dumbbell, TrendingUp, CreditCard, CheckCircle2 } from "lucide-vue-next";

const api = useApi();

const features = [
  {
    icon: Dumbbell,
    title: "EQUIPAMENTOS ELITE",
    description:
      "Máquinas de última geração e área de peso livre completa para todos os níveis de treinamento.",
  },
  {
    icon: TrendingUp,
    title: "ACOMPANHAMENTO REAL",
    description:
      "Streak diário, histórico de treinos e metas personalizadas pelo seu professor.",
  },
  {
    icon: CreditCard,
    title: "PAGAMENTO VIA PIX",
    description:
      "Geração automática de cobranças Pix com QR Code. Rápido, sem burocrecia.",
  },
];

const stats = [
  { value: "500+", label: "Alunos ativos" },
  { value: "50+", label: "Treinos disponíveis" },
  { value: "98%", label: "Satisfação" },
  { value: "24h", label: "Suporte online" },
];

const packages = ref<Package[]>([]);
const loadingPackages = ref(true);

const activePackages = computed(() =>
  packages.value
    .filter((p) => p.is_active)
    .sort((a, b) => a.display_order - b.display_order),
);

onMounted(async () => {
  try {
    packages.value = await api.get<Package[]>("/packages");
  } catch {}
  loadingPackages.value = false;
});
</script>
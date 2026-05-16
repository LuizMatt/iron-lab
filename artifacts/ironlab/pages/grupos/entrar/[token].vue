<template>
  <div class="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <NuxtLink to="/" class="font-display text-5xl text-[#a3e635] tracking-widest">
          IRONLAB
        </NuxtLink>
        <p class="text-[#737373] text-sm mt-2">Convite para grupo</p>
      </div>

      <div class="bg-[#141414] border border-[#262626] rounded-xl p-8 text-center">
        <Loader2 v-if="loading" class="w-8 h-8 animate-spin mx-auto mb-4 text-[#a3e635]" />
        <CheckCircle2 v-else-if="success" class="w-10 h-10 mx-auto mb-4 text-[#a3e635]" />
        <AlertCircle v-else class="w-10 h-10 mx-auto mb-4 text-red-400" />

        <h1 class="font-display text-3xl text-white mb-2">
          {{ loading ? "ENTRANDO NO GRUPO" : success ? "CONVITE ACEITO" : "NAO FOI POSSIVEL ENTRAR" }}
        </h1>
        <p class="text-[#737373] text-sm">
          {{ message }}
        </p>

        <NuxtLink
          v-if="!loading"
          to="/dashboard"
          class="mt-6 inline-flex items-center justify-center px-4 py-3 bg-[#a3e635] text-[#0d0d0d] rounded-lg text-sm font-bold hover:bg-[#bef264] transition-colors"
        >
          Ir para o dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-vue-next";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const api = useApi();

const loading = ref(true);
const success = ref(false);
const message = ref("Validando seu convite...");

const joinGroup = async () => {
  const token = String(route.params.token || "");
  if (!token) {
    message.value = "Link de convite inválido.";
    loading.value = false;
    return;
  }

  try {
    const joined = await api.post<GroupSummary | GroupDetail>(`/groups/join/${token}`);
    success.value = true;
    message.value = "Você entrou no grupo. Redirecionando...";
    await router.push({ path: "/dashboard", query: { tab: "grupos", group: joined.id } });
  } catch (err: unknown) {
    success.value = false;
    message.value = normalizeJoinError((err as Error).message);
  } finally {
    loading.value = false;
  }
};

const normalizeJoinError = (rawMessage?: string) => {
  const text = rawMessage || "Não foi possível entrar no grupo.";
  const lower = text.toLowerCase();
  if (lower.includes("full") || lower.includes("cheio") || lower.includes("lotado")) {
    return "Este grupo esta cheio.";
  }
  if (lower.includes("already") || lower.includes("membro") || lower.includes("member")) {
    return "Você já faz parte deste grupo.";
  }
  if (lower.includes("invalid") || lower.includes("token") || lower.includes("invalido")) {
    return "Este link de convite é inválido ou expirou.";
  }
  return text;
};

onMounted(joinGroup);
</script>

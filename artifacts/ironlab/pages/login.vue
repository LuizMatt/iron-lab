<template>
  <div class="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-10">
        <NuxtLink to="/" class="font-display text-5xl text-[#a3e635] tracking-widest">
          IRONLAB
        </NuxtLink>
        <p class="text-[#737373] text-sm mt-2">Área do Aluno e Administração</p>
      </div>

      <!-- Card -->
      <div class="bg-[#141414] border border-[#262626] rounded-xl p-8">
        <h1 class="font-display text-3xl text-white mb-1">ENTRAR</h1>
        <p class="text-[#737373] text-sm mb-8">Acesse sua conta para continuar</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-[#f5f5f5] mb-2">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="seu@email.com"
              class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm placeholder-[#555] outline-none focus:border-[#a3e635] transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#f5f5f5] mb-2">Senha</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-[#f5f5f5] text-sm placeholder-[#555] outline-none focus:border-[#a3e635] transition-colors pr-12"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#f5f5f5] transition-colors"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#a3e635] text-[#0d0d0d] font-bold py-3 rounded-lg hover:bg-[#bef264] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            {{ loading ? "Entrando..." : "ENTRAR" }}
          </button>
        </form>

        <!-- Demo credentials -->
        <div class="mt-8 pt-6 border-t border-[#262626]">
          <p class="text-[#737373] text-xs text-center mb-4">Credenciais de demonstração</p>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="cred in demoCredentials"
              :key="cred.label"
              @click="fillCredentials(cred)"
              class="flex items-center justify-between bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-2 text-xs hover:border-[#a3e635]/30 transition-colors"
            >
              <span class="text-[#f5f5f5] font-medium">{{ cred.label }}</span>
              <span class="text-[#737373]">{{ cred.email }}</span>
            </button>
          </div>
        </div>
      </div>

      <p class="text-center text-[#737373] text-xs mt-6">
        <NuxtLink to="/" class="hover:text-[#a3e635] transition-colors">
          Voltar ao site
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-vue-next";

const auth = useAuth();
const router = useRouter();

const form = reactive({ email: "", password: "" });
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);

const demoCredentials = [
  { label: "Admin", email: "admin@ironlab.com", password: "admin123" },
  { label: "Professor", email: "prof@ironlab.com", password: "prof123" },
  { label: "Aluno (Carlos)", email: "carlos@email.com", password: "aluno123" },
  { label: "Aluno (Ana)", email: "ana@email.com", password: "aluno123" },
];

const fillCredentials = (cred: (typeof demoCredentials)[0]) => {
  form.email = cred.email;
  form.password = cred.password;
};

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await auth.login(form.email, form.password);
    const role = result.user.role;
    if (role === "admin" || role === "professor") {
      await router.push("/admin");
    } else {
      await router.push("/dashboard");
    }
  } catch (err: unknown) {
    error.value =
      (err as Error).message || "Falha ao fazer login. Verifique suas credenciais.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await auth.fetchMe();
  if (auth.isAuthenticated.value) {
    const role = auth.user.value?.role;
    await router.push(role === "aluno" ? "/dashboard" : "/admin");
  }
});
</script>

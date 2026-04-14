export const useAuth = () => {
  const user = useState<User | null>("auth_user", () => null);
  const checked = useState<boolean>("auth_checked", () => false);
  const isAuthenticated = computed(() => !!user.value);

  const login = async (email: string, password: string) => {
    const data = await $fetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    user.value = data.user;
    checked.value = true;
    return data;
  };

  const logout = async () => {
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    user.value = null;
    checked.value = false;
    await navigateTo("/login");
  };

  const fetchMe = async () => {
    if (checked.value) return;
    try {
      const data = await $fetch<User>("/api/auth/me");
      user.value = data;
    } catch {
      user.value = null;
    } finally {
      checked.value = true;
    }
  };

  return { user, isAuthenticated, login, logout, fetchMe };
};

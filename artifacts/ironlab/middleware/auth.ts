export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  await auth.fetchMe();
  if (!auth.isAuthenticated.value) {
    return navigateTo("/login");
  }
});

<template>
  <NuxtPage />
</template>

<script setup lang="ts">
const auth = useAuth();

onMounted(async () => {
  await auth.fetchMe();
});
</script>

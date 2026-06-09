<script setup lang="ts">
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="var(--p-primary-500)" />
    <Toast position="top-right" />
    <ConfirmDialog />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

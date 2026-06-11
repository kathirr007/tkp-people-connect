<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div class="layout-auth">
    <div class="layout-auth__container">
      <div class="layout-auth__logo">
        <NuxtLink to="/">
          <i class="pi pi-users" />
          <span>{{ config.public.appName }}</span>
        </NuxtLink>
      </div>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-auth__logo {
  text-align: center;
  margin-bottom: 2rem;
}

.layout-auth__logo a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-primary-500);
  text-decoration: none;
}

.layout-auth__logo i {
  font-size: 2rem;
}
</style>
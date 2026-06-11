<script setup lang="ts">
const { isAuthenticated, logout } = useAuth()
const config = useRuntimeConfig()

async function handleLogout() {
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="layout-public">
    <header class="app-header-public">
      <div class="app-header-public__inner">
        <NuxtLink to="/" class="app-header-public__logo">
          <i class="pi pi-users" />
          <span>{{ config.public.appName }}</span>
        </NuxtLink>
        <nav class="app-header-public__nav">
          <NuxtLink v-if="isAuthenticated" to="/dashboard">
            Dashboard
          </NuxtLink>
          <a v-if="isAuthenticated" href="#" @click.prevent="handleLogout">
            Logout
          </a>
          <NuxtLink v-if="!isAuthenticated" to="/auth/signin">
            Sign In
          </NuxtLink>
          <NuxtLink v-if="!isAuthenticated" to="/auth/signup">
            Sign Up
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="layout-public__content">
      <slot />
    </main>
    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} {{ config.public.appName }}. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.app-header-public {
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}

.dark-mode .app-header-public {
  border-bottom-color: var(--p-surface-700);
  background: var(--p-surface-800);
}

.app-header-public__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.app-header-public__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--p-primary-500);
  text-decoration: none;
}

.app-header-public__nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.app-header-public__nav a {
  color: var(--p-text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.app-header-public__nav a:hover {
  color: var(--p-primary-500);
}

.app-footer {
  border-top: 1px solid var(--p-surface-200);
  padding: 1.5rem 2rem;
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.dark-mode .app-footer {
  border-top-color: var(--p-surface-700);
}
</style>

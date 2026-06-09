<script setup lang="ts">
import Button from 'primevue/button'

const { user, logout, isAdmin, canEdit } = useAuth()
const config = useRuntimeConfig()
const sidebarVisible = ref(true)
const route = useRoute()

const menuItems = computed(() => {
  const items = [
    { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' },
    { label: 'People', icon: 'pi pi-users', to: '/people' },
  ]

  if (canEdit.value) {
    items.push({ label: 'Add Person', icon: 'pi pi-user-plus', to: '/people/add' })
  }

  if (isAdmin.value) {
    items.push(
      { label: 'Bulk Upload', icon: 'pi pi-upload', to: '/people/bulk-upload' },
      { label: 'Users', icon: 'pi pi-shield', to: '/users' },
    )
  }

  items.push({ label: 'Settings', icon: 'pi pi-cog', to: '/settings' })

  return items
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <div class="layout-dashboard">
    <aside v-show="sidebarVisible" class="sidebar">
      <div class="sidebar__header">
        <NuxtLink to="/dashboard" class="sidebar__logo">
          <i class="pi pi-users" />
          <span>{{ config.public.appName }}</span>
        </NuxtLink>
      </div>
      <nav class="sidebar__nav">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(item.to) }"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="sidebar__footer">
        <div class="sidebar__user">
          <i class="pi pi-user" />
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ user?.firstName }} {{ user?.lastName }}</span>
            <span class="sidebar__user-role">{{ user?.role }}</span>
          </div>
        </div>
      </div>
    </aside>
    <div class="layout-dashboard__main">
      <header class="dashboard-header">
        <Button
          icon="pi pi-bars"
          text
          rounded
          @click="sidebarVisible = !sidebarVisible"
        />
        <div class="dashboard-header__right">
          <ThemeToggle />
          <Button
            icon="pi pi-sign-out"
            text
            rounded
            severity="secondary"
            @click="logout()"
          />
        </div>
      </header>
      <main class="layout-dashboard__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: var(--app-sidebar-width);
  background: var(--p-surface-0);
  border-right: 1px solid var(--p-surface-200);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.dark-mode .sidebar {
  background: var(--p-surface-800);
  border-right-color: var(--p-surface-700);
}

.sidebar__header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.dark-mode .sidebar__header {
  border-bottom-color: var(--p-surface-700);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--p-primary-500);
  text-decoration: none;
}

.sidebar__nav {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--p-text-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.sidebar__item:hover {
  background: var(--p-surface-100);
}

.dark-mode .sidebar__item:hover {
  background: var(--p-surface-700);
}

.sidebar__item--active {
  background: var(--p-primary-50);
  color: var(--p-primary-500);
}

.dark-mode .sidebar__item--active {
  background: var(--p-primary-900);
  color: var(--p-primary-300);
}

.sidebar__footer {
  padding: 1rem;
  border-top: 1px solid var(--p-surface-200);
}

.dark-mode .sidebar__footer {
  border-top-color: var(--p-surface-700);
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar__user > i {
  font-size: 1.25rem;
  color: var(--p-text-muted-color);
}

.sidebar__user-info {
  display: flex;
  flex-direction: column;
}

.sidebar__user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.sidebar__user-role {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-transform: capitalize;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}

.dark-mode .dashboard-header {
  border-bottom-color: var(--p-surface-700);
  background: var(--p-surface-800);
}

.dashboard-header__right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 100;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>

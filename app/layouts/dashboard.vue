<script setup lang="ts">
const { user, isAuthenticated, logout: doLogout } = useAuth()

async function logout() {
  await doLogout()
  await navigateTo('/auth/signin')
}
const config = useRuntimeConfig()
const sidebarVisible = ref(true)
const route = useRoute()
const sidebarRef = ref<HTMLElement | null>(null)

const menuItems = computed(() => {
  const items = [
    { label: 'People', icon: 'pi pi-users', to: '/people' },
    { label: 'Youth', icon: 'pi pi-graduation-cap', to: '/youth' },
  ]
  if (isAuthenticated.value) {
    items.unshift({ label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' })
    items.push({ label: 'Users', icon: 'pi pi-shield', to: '/users' })
    items.push({ label: 'Settings', icon: 'pi pi-cog', to: '/settings' })
    items.push({ label: 'Iconify Demo', icon: 'pi pi-star', to: '/iconify-demo' })
  }
  return items
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

onClickOutside(sidebarRef, () => {
  if (window.innerWidth <= 768) {
    sidebarVisible.value = false
  }
})
</script>

<template>
  <div class="layout-dashboard">
    <aside ref="sidebarRef" class="sidebar" :class="{ 'sidebar--collapsed': !sidebarVisible }">
      <div class="sidebar__header">
        <NuxtLink to="/" class="sidebar__logo">
          <i class="pi pi-users" />
          <span class="sidebar__logo-text">{{ config.public.appName }}</span>
        </NuxtLink>
        <!-- <Button
          :icon="sidebarVisible ? 'pi pi-angle-left' : 'pi pi-angle-right'"
          text
          rounded
          size="small"
          class="sidebar__toggle"
          @click="sidebarVisible = !sidebarVisible"
        /> -->
      </div>
      <nav class="sidebar__nav">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(item.to) }"
          :title="!sidebarVisible ? item.label : undefined"
        >
          <i :class="item.icon" />
          <span class="sidebar__item-label">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar__footer">
        <template v-if="isAuthenticated">
          <div class="sidebar__user" :title="!sidebarVisible ? `${user?.firstName} ${user?.lastName}` : undefined">
            <i class="pi pi-user" />
            <div class="sidebar__user-info">
              <span class="sidebar__user-name">{{ user?.firstName }} {{ user?.lastName }}</span>
              <span class="sidebar__user-role">{{ user?.role }}</span>
            </div>
          </div>
          <Button
            v-if="sidebarVisible"
            label="Logout"
            icon="pi pi-sign-out"
            severity="secondary"
            text
            size="small"
            class="sidebar__logout"
            @click="logout()"
          />
          <Button
            v-else
            icon="pi pi-sign-out"
            severity="secondary"
            text
            size="small"
            class="sidebar__logout"
            title="Logout"
            @click="logout()"
          />
        </template>
        <Button
          v-else
          :label="sidebarVisible ? 'Sign In' : undefined"
          icon="pi pi-sign-in"
          size="small"
          class="sidebar__logout"
          @click="navigateTo('/auth/signin')"
        />
      </div>
    </aside>
    <div class="layout-dashboard__main">
      <header class="dashboard-header">
        <Button
          :icon="sidebarVisible ? 'pi pi-angle-left' : 'pi pi-bars'"
          text
          rounded
          @click="sidebarVisible = !sidebarVisible"
        />
        <div class="dashboard-header__right">
          <ThemeToggle />
          <Button
            v-if="isAuthenticated"
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
  min-width: var(--app-sidebar-width);
  background: var(--p-surface-0);
  border-right: 1px solid var(--p-surface-200);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  transition:
    width 0.3s ease,
    min-width 0.3s ease;
}

.sidebar--collapsed {
  width: var(--app-sidebar-collapsed-width);
  min-width: var(--app-sidebar-collapsed-width);
}

.dark-mode .sidebar {
  background: var(--p-surface-800);
  border-right-color: var(--p-surface-700);
}

.sidebar__header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--p-surface-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar__toggle {
  flex-shrink: 0;
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
  overflow: hidden;
  white-space: nowrap;
}

.sidebar--collapsed .sidebar__logo-text,
.sidebar--collapsed .sidebar__item-label,
.sidebar--collapsed .sidebar__user-info,
.sidebar--collapsed .sidebar__logout .p-button-label {
  display: none;
}

.sidebar--collapsed .sidebar__nav {
  padding: 0.5rem;
}

.sidebar--collapsed .sidebar__item {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar--collapsed .sidebar__user {
  justify-content: center;
}

.sidebar--collapsed .sidebar__header {
  justify-content: center;
  padding: 1.25rem 0.75rem;
  gap: 0;
}

.sidebar--collapsed .sidebar__header .sidebar__logo {
  justify-content: center;
}

.sidebar--collapsed .sidebar__footer {
  padding: 1rem 0.5rem;
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
  margin-bottom: 0.25rem;
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

.sidebar__logout {
  margin-top: 0.75rem;
  width: 100%;
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
    transition: transform 0.3s ease;
  }

  .sidebar--collapsed {
    width: var(--app-sidebar-width);
    min-width: var(--app-sidebar-width);
    transform: translateX(-100%);
  }

  .sidebar--collapsed .sidebar__logo-text,
  .sidebar--collapsed .sidebar__item-label,
  .sidebar--collapsed .sidebar__user-info,
  .sidebar--collapsed .sidebar__logout .p-button-label {
    display: inline;
  }

  .sidebar--collapsed .sidebar__nav {
    padding: 0.75rem;
  }

  .sidebar--collapsed .sidebar__item {
    justify-content: flex-start;
    padding: 0.75rem 1rem;
  }

  .sidebar--collapsed .sidebar__user {
    justify-content: flex-start;
  }

  .sidebar--collapsed .sidebar__header {
    justify-content: space-between;
    padding: 1.25rem;
    gap: unset;
  }

  .sidebar--collapsed .sidebar__header .sidebar__logo {
    justify-content: flex-start;
  }

  .sidebar--collapsed .sidebar__footer {
    padding: 1rem;
  }
}
</style>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { data: stats, isPending } = useDashboard()
</script>

<template>
  <main>
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="visually-hidden">Statistics Overview</h2>
      <div class="stats-grid">
      <Card>
        <template #content>
          <div style="display: flex; align-items: center; gap: 1rem;" role="status" aria-live="polite">
            <i class="pi pi-users" style="font-size: 2rem; color: var(--p-primary-500);" aria-hidden="true" />
            <div>
              <p style="font-size: 0.875rem; color: var(--p-text-muted-color);">Total People</p>
              <Skeleton v-if="isPending" width="4rem" height="1.5rem" />
              <p v-else style="font-size: 1.5rem; font-weight: 700;">
                {{ stats?.totalPeople || 0 }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div style="display: flex; align-items: center; gap: 1rem;" role="status" aria-live="polite">
            <i class="pi pi-check-circle" style="font-size: 2rem; color: var(--p-green-500);" aria-hidden="true" />
            <div>
              <p style="font-size: 0.875rem; color: var(--p-text-muted-color);">Active</p>
              <Skeleton v-if="isPending" width="4rem" height="1.5rem" />
              <p v-else style="font-size: 1.5rem; font-weight: 700;">
                {{ stats?.activePeople || 0 }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div style="display: flex; align-items: center; gap: 1rem;" role="status" aria-live="polite">
            <i class="pi pi-times-circle" style="font-size: 2rem; color: var(--p-red-500);" aria-hidden="true" />
            <div>
              <p style="font-size: 0.875rem; color: var(--p-text-muted-color);">Inactive</p>
              <Skeleton v-if="isPending" width="4rem" height="1.5rem" />
              <p v-else style="font-size: 1.5rem; font-weight: 700;">
                {{ stats?.inactivePeople || 0 }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div style="display: flex; align-items: center; gap: 1rem;" role="status" aria-live="polite">
            <i class="pi pi-building" style="font-size: 2rem; color: var(--p-orange-500);" aria-hidden="true" />
            <div>
              <p style="font-size: 0.875rem; color: var(--p-text-muted-color);">Organizations</p>
              <Skeleton v-if="isPending" width="4rem" height="1.5rem" />
              <p v-else style="font-size: 1.5rem; font-weight: 700;">
                {{ stats?.totalOrganizations || 0 }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <Card>
        <template #title>
          <h3>Recently Added</h3>
        </template>
        <template #content>
          <div v-if="isPending">
            <Skeleton v-for="i in 5" :key="i" height="2rem" class="mb-2" />
          </div>
          <div v-else-if="stats?.recentlyAdded?.length">
            <div
              v-for="person in stats.recentlyAdded"
              :key="person._id"
              style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--p-surface-200);"
            >
              <div>
                <p style="font-weight: 600;">{{ person.firstName }} {{ person.lastName }}</p>
                <p style="font-size: 0.75rem; color: var(--p-text-muted-color);">{{ person.organization || 'No org' }}</p>
              </div>
              <span style="font-size: 0.75rem; color: var(--p-text-muted-color);">
                {{ new Date(person.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>
          <p v-else style="color: var(--p-text-muted-color);">
            No people added yet.
          </p>
        </template>
      </Card>

      <Card>
        <template #title>
          <h3>Top Organizations</h3>
        </template>
        <template #content>
          <div v-if="isPending">
            <Skeleton v-for="i in 5" :key="i" height="2rem" class="mb-2" />
          </div>
          <div v-else-if="stats?.byOrganization?.length">
            <div
              v-for="org in stats.byOrganization"
              :key="org.name"
              style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--p-surface-200);"
            >
              <span style="font-weight: 500;">{{ org.name }}</span>
              <span style="font-size: 0.875rem; color: var(--p-text-muted-color);">{{ org.count }} people</span>
            </div>
          </div>
          <p v-else style="color: var(--p-text-muted-color);">
            No organization data yet.
          </p>
        </template>
      </Card>
    </div>
  </main>
</template>

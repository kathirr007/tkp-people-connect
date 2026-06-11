<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { isAuthenticated } = useAuth()
</script>

<template>
  <div>
    <section class="landing-hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading">TKP People Connect - Staging</h1>
      <p>
        A comprehensive people management platform for your organization.
        Manage contacts, track relationships, and keep your directory organized.
      </p>
      <div role="group" aria-label="Quick navigation">
        <Button
          v-if="!isAuthenticated"
          label="Get Started"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="navigateTo('/register')"
        />
        <Button
          v-if="isAuthenticated"
          label="Go to Dashboard"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="navigateTo('/dashboard')"
        />
        <Button
          v-if="!isAuthenticated"
          label="Sign In"
          severity="secondary"
          outlined
          @click="navigateTo('/login')"
        />
      </div>
    </section>

    <section class="landing-features" aria-labelledby="features-heading">
      <h2 id="features-heading">Key Features</h2>
      <div class="feature-grid">
        <article class="feature-card">
          <i class="pi pi-users" style="font-size: 2rem; color: var(--p-primary-500);" aria-hidden="true" />
          <h3>People Directory</h3>
          <p>Manage and organize all your contacts in one place with powerful search and filtering.</p>
        </article>
        <article class="feature-card">
          <i class="pi pi-upload" style="font-size: 2rem; color: var(--p-primary-500);" aria-hidden="true" />
          <h3>Bulk Upload</h3>
          <p>Import thousands of contacts from CSV, Excel, or JSON files in seconds.</p>
        </article>
        <article class="feature-card">
          <i class="pi pi-shield" style="font-size: 2rem; color: var(--p-primary-500);" aria-hidden="true" />
          <h3>Role-Based Access</h3>
          <p>Control who can view, edit, or manage data with flexible role-based permissions.</p>
        </article>
        <article class="feature-card">
          <i class="pi pi-chart-bar" style="font-size: 2rem; color: var(--p-primary-500);" aria-hidden="true" />
          <h3>Dashboard</h3>
          <p>Get insights with real-time statistics and organization breakdowns.</p>
        </article>
      </div>
    </section>
  </div>
</template>
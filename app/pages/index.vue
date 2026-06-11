<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { isAuthenticated } = useAuth()
</script>

<template>
  <div>
    <section class="landing-hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading">
        TKP People Connect
      </h1>
      <p>
        A comprehensive people management platform for your organization.
        Manage contacts, track relationships, and keep your directory organized.
      </p>
      <div role="group" aria-label="Quick navigation" class="hero-actions">
        <Button
          v-if="!isAuthenticated"
          label="Get Started"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="navigateTo('/auth/signup')"
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
          @click="navigateTo('/auth/signin')"
        />
      </div>
    </section>

    <section class="landing-features" aria-labelledby="features-heading">
      <h2 id="features-heading">
        Key Features
      </h2>
      <div class="feature-grid">
        <article class="feature-card">
          <i class="pi pi-users" aria-hidden="true" />
          <h3>People Directory</h3>
          <p>Manage and organize all your contacts in one place with powerful search and filtering.</p>
        </article>
        <article class="feature-card">
          <i class="pi pi-upload" aria-hidden="true" />
          <h3>Bulk Upload</h3>
          <p>Import thousands of contacts from CSV, Excel, or JSON files in seconds.</p>
        </article>
        <article class="feature-card">
          <i class="pi pi-shield" aria-hidden="true" />
          <h3>Role-Based Access</h3>
          <p>Control who can view, edit, or manage data with flexible role-based permissions.</p>
        </article>
        <article class="feature-card">
          <i class="pi pi-chart-bar" aria-hidden="true" />
          <h3>Dashboard</h3>
          <p>Get insights with real-time statistics and organization breakdowns.</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 2rem;
  background: linear-gradient(135deg, var(--p-primary-50) 0%, var(--p-primary-100) 100%);
}

:deep(.dark-mode) .landing-hero {
  background: linear-gradient(135deg, var(--p-surface-800) 0%, var(--p-surface-900) 100%);
}

.landing-hero h1 {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--p-primary-700);
  margin: 0 0 1rem;
}

.landing-hero p {
  font-size: 1.125rem;
  color: var(--p-text-muted-color);
  max-width: 36rem;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.landing-features {
  padding: 4rem 2rem;
  max-width: 72rem;
  margin: 0 auto;
}

.landing-features h2 {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 2.5rem;
  color: var(--p-text-color);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 1.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.feature-card i {
  font-size: 2rem;
  color: var(--p-primary-500);
}

.feature-card h3 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.feature-card p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .landing-hero {
    padding: 3rem 1.5rem;
  }

  .landing-hero h1 {
    font-size: 2rem;
  }

  .landing-features {
    padding: 2.5rem 1.5rem;
  }
}
</style>

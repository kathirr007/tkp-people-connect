<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="page-landing">
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
          label="Browse People"
          icon="pi pi-users"
          @click="navigateTo('/people')"
        />
        <Button
          v-if="!isAuthenticated"
          label="Get Started"
          icon="pi pi-arrow-right"
          icon-pos="right"
          severity="secondary"
          outlined
          @click="navigateTo('/auth/signup')"
        />
        <Button
          v-if="isAuthenticated"
          label="Go to Dashboard"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="navigateTo('/dashboard')"
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

<style>
.page-landing .landing-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 2rem;
  background: linear-gradient(135deg, var(--p-primary-50) 0%, var(--p-primary-100) 100%);
}

.dark-mode .page-landing .landing-hero {
  background: linear-gradient(135deg, var(--p-surface-800) 0%, var(--p-surface-900) 100%);
}

.page-landing .landing-hero h1 {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--p-primary-700);
  margin: 0 0 1rem;
}

.dark-mode .page-landing .landing-hero h1 {
  color: var(--p-primary-300);
}

.page-landing .landing-hero p {
  font-size: 1.125rem;
  color: var(--p-text-muted-color);
  max-width: 36rem;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.page-landing .hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.page-landing .landing-features {
  padding: 4rem 2rem;
  max-width: 72rem;
  margin: 0 auto;
}

.page-landing .landing-features h2 {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 2.5rem;
  color: var(--p-text-color);
}

.page-landing .feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
}

.page-landing .feature-card {
  padding: 1.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.dark-mode .page-landing .feature-card {
  border-color: var(--p-surface-700);
  background: var(--p-surface-800);
}

.page-landing .feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.dark-mode .page-landing .feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.page-landing .feature-card i {
  font-size: 2rem;
  color: var(--p-primary-500);
}

.page-landing .feature-card h3 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.page-landing .feature-card p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-landing .landing-hero {
    padding: 3rem 1.5rem;
  }

  .page-landing .landing-hero h1 {
    font-size: 2rem;
  }

  .page-landing .landing-features {
    padding: 2.5rem 1.5rem;
  }
}
</style>

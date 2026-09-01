<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})
</script>

<template>
  <div class="iconify-demo">
    <div class="page-header">
      <h1>Iconify Integration Demo</h1>
    </div>

    <Card>
      <template #title>
        <h3>How to Use Iconify Icons</h3>
      </template>
      <template #content>
        <p>
          Iconify provides access to over 100,000+ open source vector icons from various icon sets including:
          Material Symbols, Lucide, Feather, Font Awesome, Tabler Icons, and many more.
        </p>

        <h4>Usage in Templates</h4>
        <pre><code>&lt;template&gt;
  &lt;!-- Using the Icon component --&gt;
  &lt;Icon icon="material-symbols:home" /&gt;
  &lt;Icon icon="lucide:user" /&gt;
  &lt;Icon icon="mdi:account-circle" /&gt;
&lt;/template&gt;</code></pre>

        <h4>Find More Icons</h4>
        <p>
          Browse all available icons at:
          <a href="https://icon-sets.iconify.design/" target="_blank">https://icon-sets.iconify.design/</a>
        </p>

        <h4>Comparison with Current PrimeIcons</h4>
        <p>
          You can continue using PrimeIcons (the <code>pi pi-*</code> classes) alongside Iconify icons.
          This allows a gradual migration and gives you access to a much larger icon library.
        </p>
      </template>
    </Card>

    <Card>
      <template #title>
        <h3>Icon Examples</h3>
      </template>
      <template #content>
        <div class="icon-comparison">
          <div class="icon-group">
            <h4>PrimeIcons (Existing)</h4>
            <div class="icon-row">
              <div class="icon-item">
                <i class="pi pi-users" />
                <span>pi pi-users</span>
              </div>
              <div class="icon-item">
                <i class="pi pi-home" />
                <span>pi pi-home</span>
              </div>
              <div class="icon-item">
                <i class="pi pi-cog" />
                <span>pi pi-cog</span>
              </div>
              <div class="icon-item">
                <i class="pi pi-search" />
                <span>pi pi-search</span>
              </div>
            </div>
          </div>

          <div class="icon-group">
            <h4>Iconify Icons (New)</h4>
            <div class="icon-row">
              <div class="icon-item">
                <Icon icon="material-symbols:people" />
                <span>material-symbols:people</span>
              </div>
              <div class="icon-item">
                <Icon icon="lucide:home" />
                <span>lucide:home</span>
              </div>
              <div class="icon-item">
                <Icon icon="mdi:cog" />
                <span>mdi:cog</span>
              </div>
              <div class="icon-item">
                <Icon icon="lucide:search" />
                <span>lucide:search</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.iconify-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.icon-comparison {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.icon-group {
  margin-bottom: 1.5rem;
}

.icon-group h4 {
  margin-bottom: 1rem;
  color: var(--p-text-color);
}

.icon-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 0.5rem;
  min-width: 100px;
  text-align: center;
}

.icon-item i,
.icon-item :deep(.iconify-icon) {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--p-primary-500);
}

.icon-item span {
  font-size: 0.75rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

pre {
  background: var(--p-surface-50);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

a {
  color: var(--p-primary-500);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.dark-mode .icon-item {
  border-color: var(--p-surface-700);
}

.dark-mode pre {
  background: var(--p-surface-800);
}
</style>

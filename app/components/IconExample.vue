<script setup lang="ts">
// Icon component is registered globally via the iconify module
</script>

<template>
  <div class="icon-example">
    <h3>Icon Comparison</h3>

    <!-- Using PrimeIcons (current approach) -->
    <div class="icon-set">
      <h4>PrimeIcons (Current)</h4>
      <div class="icon-grid">
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
      </div>
    </div>

    <!-- Using Iconify (new approach) -->
    <div class="icon-set">
      <h4>Iconify Icons (New)</h4>
      <div class="icon-grid">
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-example {
  padding: 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.icon-set {
  margin-bottom: 1.5rem;
}

.icon-set h4 {
  margin-bottom: 0.75rem;
  color: var(--p-text-color);
}

.icon-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 0.5rem;
  min-width: 80px;
}

.icon-item i,
.icon-item :deep(.iconify) {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--p-primary-500);
}

.icon-item span {
  font-size: 0.75rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.dark-mode .icon-example {
  border-color: var(--p-surface-700);
}

.dark-mode .icon-item {
  border-color: var(--p-surface-700);
}
</style>

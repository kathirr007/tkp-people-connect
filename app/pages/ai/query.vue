<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>AI Data Assistant</h1>
    </div>
    <Card class="ai-query-card">
      <template #content>
        <AiQueryPanel />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.ai-query-card {
  height: calc(100vh - 12rem);
  overflow: hidden;
}

.ai-query-card :deep(.p-card-body) {
  height: 100%;
  padding: 0;
}

.ai-query-card :deep(.p-card-content) {
  height: 100%;
  padding: 0;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .ai-query-card {
    height: calc(100vh - 9rem);
    margin: 0 -0.25rem;
  }
}

@media (max-width: 480px) {
  .ai-query-card {
    height: calc(100svh - 8rem);
    border-radius: 0.75rem;
  }
}
</style>

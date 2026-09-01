<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>AI Data Assistant</h1>
    </div>
    <Card style="height: calc(100vh - 12rem);">
      <template #content>
        <AiQueryPanel />
      </template>
    </Card>
  </div>
</template>

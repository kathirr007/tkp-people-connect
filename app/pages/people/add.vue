<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'user',
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Add Person</h1>
    </div>
    <PersonForm mode="create" @success="navigateTo('/people')" />
  </div>
</template>

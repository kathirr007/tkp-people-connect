<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const router = useRouter()

function handleSelect(id: string, type: 'people' | 'youth') {
  router.push(type === 'people' ? `/people/${id}` : `/youth/${id}`)
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>AI Search</h1>
    </div>
    <Card>
      <template #content>
        <AiSearchPanel @select="handleSelect" />
      </template>
    </Card>
  </div>
</template>

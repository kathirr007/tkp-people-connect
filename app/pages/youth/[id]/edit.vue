<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'user',
})

const route = useRoute()
const id = computed(() => route.params.id as string)
const { data, isPending } = useYouthRecord(id)

const person = computed(() => data.value?.data)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Edit Youth</h1>
    </div>

    <Card v-if="isPending">
      <template #content>
        <Skeleton v-for="i in 8" :key="i" height="2.5rem" class="mb-3" />
      </template>
    </Card>

    <YouthForm
      v-else-if="person"
      mode="edit"
      :initial-data="person"
      @success="navigateTo(`/youth/${id}`)"
    />
  </div>
</template>

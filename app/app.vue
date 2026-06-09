<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const { fetchUser } = useAuth()

await fetchUser()
</script>

<template>
  <div>
    <Toast position="top-right" />
    <ConfirmDialog />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

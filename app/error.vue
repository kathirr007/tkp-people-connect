<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error.statusCode || 500)

const title = computed(() => {
  switch (statusCode.value) {
    case 404: return 'Page Not Found'
    case 403: return 'Access Denied'
    case 401: return 'Unauthorized'
    case 500: return 'Server Error'
    default: return 'Something Went Wrong'
  }
})

const description = computed(() => {
  switch (statusCode.value) {
    case 404: return 'The page you are looking for doesn\'t exist or has been moved.'
    case 403: return 'You don\'t have permission to access this resource.'
    case 401: return 'Please log in to access this page.'
    case 500: return 'We\'re experiencing some issues. Please try again later.'
    default: return props.error.message || 'An unexpected error occurred.'
  }
})

function handleError() {
  clearError({ redirect: '/' })
}

function goBack() {
  clearError({ redirect: '/dashboard' })
}
</script>

<template>
  <div class="error-page">
    <h1>{{ statusCode }}</h1>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
      <Button label="Go Home" icon="pi pi-home" @click="handleError" />
      <Button label="Dashboard" icon="pi pi-arrow-left" severity="secondary" outlined @click="goBack" />
    </div>
  </div>
</template>

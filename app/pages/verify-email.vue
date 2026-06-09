<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    error.value = 'Invalid verification link.'
    loading.value = false
    return
  }

  try {
    await $fetch('/api/auth/verify-email', { query: { token } })
    success.value = true
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Verification failed'
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <Card>
    <template #title>
      Email Verification
    </template>
    <template #content>
      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <ProgressSpinner />
        <p style="margin-top: 1rem;">Verifying your email...</p>
      </div>
      <div v-else-if="success">
        <Message severity="success" :closable="false">
          Your email has been verified successfully!
        </Message>
        <Button
          label="Go to Login"
          class="mt-3"
          fluid
          @click="navigateTo('/login')"
        />
      </div>
      <div v-else>
        <Message severity="error" :closable="false">
          {{ error }}
        </Message>
        <Button
          label="Back to Home"
          class="mt-3"
          fluid
          severity="secondary"
          @click="navigateTo('/')"
        />
      </div>
    </template>
  </Card>
</template>

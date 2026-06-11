<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { resetPassword } = useAuth()
const { showApiError } = useToastMessages()
const route = useRoute()

const password = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const token = computed(() => route.query.token as string || '')

async function handleSubmit() {
  if (!token.value) {
    error.value = 'Invalid reset link. Please request a new one.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await resetPassword(token.value, password.value)
    success.value = true
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Password reset failed'
    showApiError(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <Card>
    <template #title>
      Reset Password
    </template>
    <template #subtitle>
      Enter your new password below.
    </template>
    <template #content>
      <div v-if="success">
        <Message severity="success" :closable="false">
          Password reset successful! You can now log in with your new password.
        </Message>
        <Button
          label="Go to Sign In"
          class="mt-3"
          fluid
          @click="navigateTo('/auth/signin')"
        />
      </div>
      <form v-else @submit.prevent="handleSubmit">
        <Message v-if="error" severity="error" :closable="false" class="mb-3">
          {{ error }}
        </Message>
        <div class="form-field" style="margin-bottom: 1.5rem;">
          <label for="password">New Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            toggle-mask
            fluid
          />
        </div>
        <Button
          type="submit"
          label="Reset Password"
          :loading="loading"
          fluid
        />
      </form>
    </template>
  </Card>
</template>

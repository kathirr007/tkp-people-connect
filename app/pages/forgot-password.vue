<script setup lang="ts">
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

definePageMeta({ layout: 'auth' })

const { forgotPassword } = useAuth()
const { showApiError } = useToastMessages()

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await forgotPassword(email.value)
    sent.value = true
  }
  catch (e) {
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
      Forgot Password
    </template>
    <template #subtitle>
      Enter your email to receive a password reset link.
    </template>
    <template #content>
      <div v-if="sent">
        <Message severity="success" :closable="false">
          If an account exists with that email, a password reset link has been sent. Please check your inbox.
        </Message>
        <Button
          label="Back to Login"
          class="mt-3"
          fluid
          severity="secondary"
          @click="navigateTo('/login')"
        />
      </div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-field" style="margin-bottom: 1.5rem;">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your registered email"
            fluid
          />
        </div>
        <Button
          type="submit"
          label="Send Reset Link"
          :loading="loading"
          fluid
        />
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem;">
          <NuxtLink to="/login" style="color: var(--p-primary-500); font-weight: 600;">
            Back to Login
          </NuxtLink>
        </p>
      </form>
    </template>
  </Card>
</template>

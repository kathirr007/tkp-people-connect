<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, resendVerificationEmail } = useAuth()
const { showApiError } = useToastMessages()

const form = reactive({
  identifier: '',
  password: '',
})
const loading = ref(false)
const error = ref('')
const resendLoading = ref(false)
const resendMessage = ref('')
const resendError = ref('')

const canResendVerification = computed(() =>
  error.value === 'Please verify your email before logging in' && form.identifier.trim().length > 0,
)

async function handleLogin() {
  error.value = ''
  resendMessage.value = ''
  resendError.value = ''
  loading.value = true
  try {
    await login(form)
    await navigateTo('/dashboard')
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Login failed'
    showApiError(e)
  }
  finally {
    loading.value = false
  }
}

async function handleResendVerification() {
  resendMessage.value = ''
  resendError.value = ''

  if (!form.identifier.trim()) {
    resendError.value = 'Please enter your email or username to resend verification.'
    return
  }

  resendLoading.value = true
  try {
    const response = await resendVerificationEmail(form.identifier)
    resendMessage.value = response.message
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    resendError.value = err?.data?.message || 'Unable to resend verification email.'
  }
  finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <Card>
    <template #title>
      Sign In
    </template>
    <template #subtitle>
      Welcome back! Enter your credentials to continue.
    </template>
    <template #content>
      <form @submit.prevent.stop="handleLogin">
        <Message v-if="error" severity="error" :closable="false" class="mb-3">
          {{ error }}
        </Message>
        <div v-if="canResendVerification" class="mb-3">
          <p style="font-size: 0.95rem; margin-bottom: 0.75rem;">
            Didn't receive the verification email? You can resend it now.
          </p>
          <Button
            type="button"
            label="Resend verification email"
            :loading="resendLoading"
            fluid
            severity="secondary"
            @click="handleResendVerification"
          />
          <Message
            v-if="resendMessage"
            severity="success"
            :closable="false"
            class="mt-3"
          >
            {{ resendMessage }}
          </Message>
          <Message
            v-if="resendError"
            severity="warn"
            :closable="false"
            class="mt-3"
          >
            {{ resendError }}
          </Message>
        </div>
        <div class="form-field" style="margin-bottom: 1rem;">
          <label for="identifier">Email or Username</label>
          <InputText
            id="identifier"
            v-model="form.identifier"
            placeholder="Enter your email or username"
            fluid
          />
        </div>
        <div class="form-field" style="margin-bottom: 1rem;">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Enter your password"
            :feedback="false"
            toggle-mask
            fluid
          />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <NuxtLink to="/forgot-password" style="font-size: 0.875rem; color: var(--p-primary-500);">
            Forgot password?
          </NuxtLink>
        </div>
        <Button
          type="submit"
          label="Sign In"
          :loading="loading"
          fluid
        />
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem;">
          Don't have an account?
          <NuxtLink to="/register" style="color: var(--p-primary-500); font-weight: 600;">
            Sign up
          </NuxtLink>
        </p>
      </form>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { z } from 'zod'

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
const touched = reactive({
  identifier: false,
  password: false,
})

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

const canResendVerification = computed(() =>
  error.value === 'Please verify your email before logging in' && form.identifier.trim().length > 0,
)

const isLoginValid = computed(() => {
  const result = loginSchema.safeParse(form)
  return result.success
})

const loginErrors = computed(() => {
  const result = loginSchema.safeParse(form)
  if (!result.success) {
    return result.error.flatten().fieldErrors
  }
  return {}
})

const loginErrorMessages = computed(() => {
  const errors = loginErrors.value
  const msgs: Record<string, string | undefined> = {}
  
  // For each field, check if required error exists first
  if (!form.identifier && errors.identifier?.includes('Username or email is required')) {
    msgs.identifier = 'Username or email is required'
  } else if (errors.identifier?.length) {
    msgs.identifier = errors.identifier[0]
  }
  
  if (!form.password && errors.password?.includes('Password is required')) {
    msgs.password = 'Password is required'
  } else if (errors.password?.length) {
    msgs.password = errors.password[0]
  }
  
  return msgs
})

const showIdentifierError = computed(() => {
  if (!touched.identifier) return false
  return !form.identifier || loginErrors.value?.identifier && loginErrors.value?.identifier?.length > 0
})

const showPasswordError = computed(() => {
  if (!touched.password) return false
  return !form.password || loginErrors.value?.password && loginErrors.value?.password?.length > 0
})

async function handleLogin() {
  if (!isLoginValid.value) return
  
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
      <h1>Sign In</h1>
    </template>
    <template #subtitle>
      <p>Welcome back! Enter your credentials to continue.</p>
    </template>
    <template #content>
      <form @submit.prevent.stop="handleLogin" role="form" aria-labelledby="form-title">
        <Message v-if="error" severity="error" :closable="false" class="mb-3" role="alert">
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
            role="status"
          >
            {{ resendMessage }}
          </Message>
          <Message
            v-if="resendError"
            severity="warn"
            :closable="false"
            class="mt-3"
            role="alert"
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
            @blur="touched.identifier = true"
            aria-describedby="identifier-error"
            :aria-invalid="showIdentifierError"
            autocomplete="username"
          />
          <small v-if="showIdentifierError" id="identifier-error" class="p-error" role="alert">{{ loginErrorMessages.identifier }}</small>
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
            @blur="touched.password = true"
            aria-describedby="password-error"
            :aria-invalid="showPasswordError"
            autocomplete="current-password"
          />
          <small v-if="showPasswordError" id="password-error" class="p-error" role="alert">{{ loginErrorMessages.password }}</small>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <NuxtLink to="/auth/forgot-password" style="font-size: 0.875rem; color: var(--p-primary-500);">
            Forgot password?
          </NuxtLink>
        </div>
        <Button
          type="submit"
          label="Sign In"
          :loading="loading"
          :disabled="!isLoginValid"
          fluid
        />
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem;">
          Don't have an account?
          <NuxtLink to="/auth/signup" style="color: var(--p-primary-500); font-weight: 600;">
            Sign up
          </NuxtLink>
        </p>
      </form>
    </template>
  </Card>
</template>
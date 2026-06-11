<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const { showSuccess, showApiError } = useToastMessages()

const form = reactive({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const loading = ref(false)
const error = ref('')
const success = ref(false)
const touched = reactive({
  username: false,
  firstName: false,
  email: false,
  password: false,
  confirmPassword: false,
})

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().min(3, 'First name must be at least 3 characters'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const isRegisterValid = computed(() => {
  const result = registerSchema.safeParse(form)
  return result.success
})

const registerErrors = computed(() => {
  const result = registerSchema.safeParse(form)
  if (!result.success) {
    return result.error.flatten().fieldErrors
  }
  return {}
})

const registerErrorMessages = computed(() => {
  const errors = registerErrors.value
  const msgs: Record<string, string | undefined> = {}
  
  if (!form.username && errors.username?.includes('Username is required')) {
    msgs.username = 'Username is required'
  } else if (errors.username?.length) {
    msgs.username = errors.username[0]
  }
  
  if (!form.firstName && errors.firstName?.includes('First name is required')) {
    msgs.firstName = 'First name is required'
  } else if (errors.firstName?.length) {
    msgs.firstName = errors.firstName[0]
  }
  
  if (!form.email && errors.email?.includes('Email is required')) {
    msgs.email = 'Email is required'
  } else if (errors.email?.length) {
    msgs.email = errors.email[0]
  }
  
  if (form.password.length < 8 && errors.password?.includes('Password must be at least 8 characters')) {
    msgs.password = 'Password must be at least 8 characters'
  } else if (errors.password?.length) {
    msgs.password = errors.password[0]
  }
  
  if (form.password !== form.confirmPassword && errors.confirmPassword?.includes("Passwords don't match")) {
    msgs.confirmPassword = "Passwords don't match"
  } else if (errors.confirmPassword?.length) {
    msgs.confirmPassword = errors.confirmPassword[0]
  }
  
  return msgs
})

const showUsernameError = computed(() => {
  if (!touched.username) return false
  return !form.username || registerErrors.value.username && registerErrors.value.username?.length > 0
})

const showFirstNameError = computed(() => {
  if (!touched.firstName) return false
  return !form.firstName || registerErrors.value.firstName && registerErrors.value.firstName?.length > 0
})

const showEmailError = computed(() => {
  if (!touched.email) return false
  return !form.email || registerErrors.value.email && registerErrors.value.email?.length > 0
})

const showPasswordError = computed(() => {
  if (!touched.password) return false
  return registerErrors.value.password && registerErrors.value.password?.length > 0 || form.password.length < 8
})

const showConfirmPasswordError = computed(() => {
  if (!touched.confirmPassword) return false
  return registerErrors.value.confirmPassword && registerErrors.value.confirmPassword?.length > 0 || form.password !== form.confirmPassword
})

async function handleRegister() {
  if (!isRegisterValid.value) return
  
  error.value = ''
  loading.value = true
  try {
    await register(form)
    success.value = true
    showSuccess('Registration successful!', 'Please check your email to verify your account.')
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Registration failed'
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
      Create Account
    </template>
    <template #subtitle>
      Join TKP People Connect to start managing contacts.
    </template>
    <template #content>
      <div v-if="success">
        <Message severity="success" :closable="false">
          Registration successful! Please check your email to verify your account before logging in.
        </Message>
        <Button
          label="Go to Login"
          class="mt-3"
          fluid
          @click="navigateTo('/login')"
        />
      </div>
      <form v-else @submit.prevent="handleRegister">
        <Message v-if="error" severity="error" :closable="false" class="mb-3">
          {{ error }}
        </Message>
        <div class="form-field" style="margin-bottom: 1rem;">
          <label for="username">Username *</label>
          <InputText
            id="username"
            v-model="form.username"
            placeholder="Choose a username"
            fluid
            @input="touched.username = true"
            @blur="touched.username = true"
          />
          <small v-if="showUsernameError" class="p-error">{{ registerErrorMessages.username }}</small>
        </div>
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-field">
            <label for="firstName">First Name *</label>
            <InputText
              id="firstName"
              v-model="form.firstName"
              placeholder="First name"
              @input="touched.firstName = true"
              @blur="touched.firstName = true"
            />
            <small v-if="showFirstNameError" class="p-error">{{ registerErrorMessages.firstName }}</small>
          </div>
          <div class="form-field">
            <label for="lastName">Last Name</label>
            <InputText
              id="lastName"
              v-model="form.lastName"
              placeholder="Last name"
            />
          </div>
        </div>
        <div class="form-field" style="margin-bottom: 1rem;">
          <label for="email">Email *</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            fluid
            @input="touched.email = true"
            @blur="touched.email = true"
          />
          <small v-if="showEmailError" class="p-error">{{ registerErrorMessages.email }}</small>
        </div>
        <div class="form-field" style="margin-bottom: 1rem;">
          <label for="password">Password *</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Min 8 chars"
            toggle-mask
            fluid
            @input="touched.password = true"
            @blur="touched.password = true"
          />
          <small v-if="showPasswordError" class="p-error">{{ registerErrorMessages.password }}</small>
        </div>
        <div class="form-field" style="margin-bottom: 1.5rem;">
          <label for="confirmPassword">Confirm Password *</label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Confirm your password"
            toggle-mask
            fluid
            @input="touched.confirmPassword = true"
            @blur="touched.confirmPassword = true"
          />
          <small v-if="showConfirmPasswordError" class="p-error">{{ registerErrorMessages.confirmPassword }}</small>
        </div>
        <Button
          type="submit"
          label="Create Account"
          :loading="loading"
          :disabled="!isRegisterValid"
          fluid
        />
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem;">
          Already have an account?
          <NuxtLink to="/login" style="color: var(--p-primary-500); font-weight: 600;">
            Sign in
          </NuxtLink>
        </p>
      </form>
    </template>
  </Card>
</template>

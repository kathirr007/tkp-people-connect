<script setup lang="ts">
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const { showSuccess, showApiError } = useToastMessages()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleRegister() {
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
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-field">
            <label for="firstName">First Name</label>
            <InputText
              id="firstName"
              v-model="form.firstName"
              placeholder="First name"
            />
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
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            fluid
          />
        </div>
        <div class="form-field" style="margin-bottom: 1.5rem;">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            toggle-mask
            fluid
          />
        </div>
        <Button
          type="submit"
          label="Create Account"
          :loading="loading"
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

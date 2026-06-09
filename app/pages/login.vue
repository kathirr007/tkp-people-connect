<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const { showApiError } = useToastMessages()

const form = reactive({
  email: '',
  password: '',
})
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
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

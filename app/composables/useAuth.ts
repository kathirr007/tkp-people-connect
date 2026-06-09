import type { AuthUser, LoginCredentials, RegisterData } from '~~/shared/types'

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canEdit = computed(() => user.value?.role === 'admin' || user.value?.role === 'user')

  async function login(credentials: LoginCredentials) {
    const data = await $fetch<{ success: boolean, user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    user.value = data.user
    return data
  }

  async function register(data: RegisterData) {
    return $fetch<{ success: boolean, message: string }>('/api/auth/register', {
      method: 'POST',
      body: data,
    })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  async function fetchUser() {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me', { headers })
      user.value = data.user
    }
    catch {
      user.value = null
    }
  }

  async function forgotPassword(email: string) {
    return $fetch<{ success: boolean, message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  async function resetPassword(token: string, password: string) {
    return $fetch<{ success: boolean, message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    canEdit,
    login,
    register,
    logout,
    fetchUser,
    forgotPassword,
    resetPassword,
  }
}

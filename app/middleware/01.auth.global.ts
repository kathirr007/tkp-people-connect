export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path === '/people' || /^\/people\/[^/]+$/.test(to.path)

  if (!isAuthenticated.value) {
    await fetchUser()
  }

  if (isAuthenticated.value && authRoutes.includes(to.path)) {
    return navigateTo('/dashboard')
  }

  if (!isPublicRoute && !isAuthenticated.value) {
    return navigateTo('/auth/signin')
  }
})

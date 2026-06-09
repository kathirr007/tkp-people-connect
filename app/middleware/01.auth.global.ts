export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  if (!isAuthenticated.value) {
    await fetchUser()
  }

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (isAuthenticated.value && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/dashboard')
  }

  if (!isPublicRoute && !isAuthenticated.value) {
    return navigateTo('/login')
  }
})

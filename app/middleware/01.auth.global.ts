export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!isAuthenticated.value && !isPublicRoute) {
    await fetchUser()
  }

  if (isAuthenticated.value && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/dashboard')
  }

  if (!isPublicRoute && !isAuthenticated.value) {
    return navigateTo('/login')
  }
})

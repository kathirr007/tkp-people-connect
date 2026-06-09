export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (isAuthenticated.value && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/dashboard')
  }

  if (!isPublicRoute && !isAuthenticated.value) {
    return navigateTo('/login')
  }
})

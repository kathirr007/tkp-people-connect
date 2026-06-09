import { hasPermission, type Role } from '~~/shared/utils/roles'

export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  const requiredRole = to.meta.requiredRole as Role | undefined
  if (!requiredRole || !user.value)
    return

  if (!hasPermission(user.value.role as Role, requiredRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not have permission to access this page',
    })
  }
})

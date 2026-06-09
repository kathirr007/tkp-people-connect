export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  user: 2,
  viewer: 1,
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  user: 'User',
  viewer: 'Viewer',
}

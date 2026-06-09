import type { H3Event } from 'h3'
import { ZodError } from 'zod'
import type { TokenPayload } from './jwt'

export function handleApiError(error: unknown): never {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of error.issues) {
      const path = issue.path.join('.')
      if (!fieldErrors[path])
        fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }

    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      message: 'The provided data is invalid',
      data: { errors: fieldErrors },
    })
  }

  if (error instanceof Error && 'statusCode' in error) {
    throw error
  }

  console.error('[API Error]', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: 'An unexpected error occurred',
  })
}

export function requireAuth(event: H3Event): TokenPayload {
  const user = event.context.auth as TokenPayload | undefined
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
    })
  }
  return user
}

export function requireRole(event: H3Event, roles: string[]): TokenPayload {
  const user = requireAuth(event)
  if (!roles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Insufficient permissions',
    })
  }
  return user
}

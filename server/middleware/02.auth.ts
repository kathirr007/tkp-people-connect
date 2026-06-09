export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/refresh',
  ]

  if (!path.startsWith('/api') || publicPaths.includes(path)) {
    return
  }

  const accessToken = getCookie(event, 'access_token')

  if (!accessToken) {
    const refreshToken = getCookie(event, 'refresh_token')
    if (refreshToken) {
      try {
        const payload = await verifyRefreshToken(refreshToken)
        const newAccessToken = await generateAccessToken(payload)
        setCookie(event, 'access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 15,
          path: '/',
        })
        event.context.auth = payload
        return
      }
      catch {
        // Refresh token invalid
      }
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  try {
    const payload = await verifyAccessToken(accessToken)
    event.context.auth = payload
  }
  catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }
})

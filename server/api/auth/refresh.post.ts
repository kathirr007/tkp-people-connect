import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const refreshTokenCookie = getCookie(event, 'refresh_token')

  if (!refreshTokenCookie) {
    throw createError({
      statusCode: 401,
      message: 'No refresh token provided',
    })
  }

  try {
    const payload = await verifyRefreshToken(refreshTokenCookie)

    const user = await User.findById(payload.userId).select('+refreshToken')
    if (!user || user.refreshToken !== refreshTokenCookie) {
      throw createError({
        statusCode: 401,
        message: 'Invalid refresh token',
      })
    }

    const tokenPayload = {
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    }

    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateAccessToken(tokenPayload),
      generateRefreshToken(tokenPayload),
    ])

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken })
    setAuthCookies(event, newAccessToken, newRefreshToken)

    return { success: true }
  }
  catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired refresh token',
    })
  }
})

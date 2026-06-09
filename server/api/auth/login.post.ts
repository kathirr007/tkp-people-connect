import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = loginSchema.parse(body)

    const user = await User.findOne({ email: validated.email }).select('+password')
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    const isValidPassword = await verifyPassword(validated.password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    if (!user.isVerified) {
      throw createError({
        statusCode: 403,
        message: 'Please verify your email before logging in',
      })
    }

    const tokenPayload = {
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    }

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(tokenPayload),
      generateRefreshToken(tokenPayload),
    ])

    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLogin: new Date(),
    })

    setAuthCookies(event, accessToken, refreshToken)

    return {
      success: true,
      user: {
        userId: user._id!.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

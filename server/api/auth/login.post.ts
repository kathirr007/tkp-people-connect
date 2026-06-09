export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = loginSchema.parse(body)

    const user = await findUserByIdentifier(validated.identifier)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    const isValidPassword = await verifyPassword(validated.password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    if (!user.isVerified) {
      throw createError({
        statusCode: 403,
        message: 'Please verify your email before logging in',
      })
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(tokenPayload),
      generateRefreshToken(tokenPayload),
    ])

    await updateUser(user.id, {
      refreshToken,
      lastLogin: new Date().toISOString(),
    })

    setAuthCookies(event, accessToken, refreshToken)

    return {
      success: true,
      user: {
        userId: user.id,
        username: user.username,
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

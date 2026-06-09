export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const user = await findUserById(auth.userId)
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  return {
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
})

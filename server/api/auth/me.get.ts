import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const user = await User.findById(auth.userId)
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  return {
    user: {
      userId: user._id!.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    },
  }
})

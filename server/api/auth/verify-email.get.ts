import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Verification token is required',
    })
  }

  const user = await User.findOne({ verificationToken: token })

  if (!user) {
    throw createError({
      statusCode: 400,
      message: 'Invalid verification token',
    })
  }

  await User.findByIdAndUpdate(user._id, {
    isVerified: true,
    verificationToken: null,
  })

  return {
    success: true,
    message: 'Email verified successfully. You can now log in.',
  }
})

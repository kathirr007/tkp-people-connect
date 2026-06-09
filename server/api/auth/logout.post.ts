import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  await User.findByIdAndUpdate(user.userId, { refreshToken: null })
  clearAuthCookies(event)

  return { success: true, message: 'Logged out successfully' }
})

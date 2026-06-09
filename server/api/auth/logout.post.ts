export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  await updateUser(user.userId, { refreshToken: null })
  clearAuthCookies(event)

  return { success: true, message: 'Logged out successfully' }
})

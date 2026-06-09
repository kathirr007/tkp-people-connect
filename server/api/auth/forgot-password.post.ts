import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = forgotPasswordSchema.parse(body)

    const user = await findUserByEmail(email)

    if (!user) {
      return {
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      }
    }

    const resetToken = randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    })

    sendPasswordResetEmail(email, resetToken).catch(console.error)

    return {
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

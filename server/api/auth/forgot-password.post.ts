import { randomBytes } from 'node:crypto'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = forgotPasswordSchema.parse(body)

    const user = await User.findOne({ email })

    if (!user) {
      return {
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      }
    }

    const resetToken = randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000)

    await User.findByIdAndUpdate(user._id, {
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

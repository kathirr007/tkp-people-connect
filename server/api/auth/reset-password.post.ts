import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = resetPasswordSchema.parse(body)

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) {
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired reset token',
      })
    }

    const hashedPwd = await hashPassword(password)

    await User.findByIdAndUpdate(user._id, {
      password: hashedPwd,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null,
    })

    return {
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

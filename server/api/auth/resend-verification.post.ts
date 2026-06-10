import { randomBytes } from 'node:crypto'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { identifier } = z
      .object({ identifier: z.string().trim().min(1, 'Email or username is required') })
      .parse(body)

    const user = await findUserByIdentifier(identifier)

    if (!user) {
      return {
        success: true,
        message: 'If an unverified account exists with that email or username, a verification link has been sent.',
      }
    }

    if (user.isVerified) {
      return {
        success: true,
        message: 'Your email is already verified. Please log in.',
      }
    }

    const verificationToken = randomBytes(32).toString('hex')

    await updateUser(user.id, {
      verificationToken,
    })

    await sendVerificationEmail(user.email, verificationToken)

    return {
      success: true,
      message: 'Verification email resent. Please check your inbox.',
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

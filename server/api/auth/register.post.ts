import { randomBytes } from 'node:crypto'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = registerSchema.parse(body)

    const existingUser = await User.findOne({ email: validated.email })
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email already registered',
      })
    }

    const hashedPwd = await hashPassword(validated.password)
    const verificationToken = randomBytes(32).toString('hex')

    await User.create({
      ...validated,
      password: hashedPwd,
      verificationToken,
      role: 'viewer',
    })

    sendVerificationEmail(validated.email, verificationToken).catch(console.error)

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

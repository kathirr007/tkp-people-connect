import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = registerSchema.parse(body)

    const existingUser = await findUserByEmail(validated.email)
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email already registered',
      })
    }

    const hashedPwd = await hashPassword(validated.password)
    const verificationToken = randomBytes(32).toString('hex')

    await createUser({
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

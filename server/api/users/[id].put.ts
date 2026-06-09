import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const admin = requireRole(event, ['admin'])

  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { role } = updateRoleSchema.parse(body)

    if (id === admin.userId) {
      throw createError({
        statusCode: 400,
        message: 'Cannot change your own role',
      })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    )

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    sendRoleChangeNotification(user.email, role).catch(console.error)

    return { success: true, data: user }
  }
  catch (error) {
    handleApiError(error)
  }
})

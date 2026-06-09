export default defineEventHandler(async (event) => {
  const admin = requireRole(event, ['admin'])

  try {
    const id = getRouterParam(event, 'id')!
    const body = await readBody(event)
    const { role } = updateRoleSchema.parse(body)

    if (id === admin.userId) {
      throw createError({
        statusCode: 400,
        message: 'Cannot change your own role',
      })
    }

    const user = await findUserById(id)
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    await updateUser(id, { role })

    sendRoleChangeNotification(user.email, role).catch(console.error)

    return { success: true, data: { ...user, role } }
  }
  catch (error) {
    handleApiError(error)
  }
})

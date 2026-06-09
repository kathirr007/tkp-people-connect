export default defineEventHandler(async (event) => {
  requireRole(event, ['admin'])

  const id = getRouterParam(event, 'id')!

  const deleted = await deletePerson(id)
  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'Person not found',
    })
  }

  return { success: true, message: 'Person deleted successfully' }
})

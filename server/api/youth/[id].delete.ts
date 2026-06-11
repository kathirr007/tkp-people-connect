export default defineEventHandler(async (event) => {
  requireRole(event, ['admin'])

  const id = getRouterParam(event, 'id')!

  const deleted = await deleteYouth(id)
  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'Youth record not found',
    })
  }

  return { success: true, message: 'Youth record deleted successfully' }
})

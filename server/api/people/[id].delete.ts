import { Person } from '../../models/Person'

export default defineEventHandler(async (event) => {
  requireRole(event, ['admin'])

  const id = getRouterParam(event, 'id')

  const person = await Person.findByIdAndDelete(id)
  if (!person) {
    throw createError({
      statusCode: 404,
      message: 'Person not found',
    })
  }

  return { success: true, message: 'Person deleted successfully' }
})

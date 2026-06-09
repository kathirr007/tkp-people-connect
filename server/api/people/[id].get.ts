import { Person } from '../../models/Person'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')

  const person = await Person.findById(id).lean()
  if (!person) {
    throw createError({
      statusCode: 404,
      message: 'Person not found',
    })
  }

  return { data: person }
})

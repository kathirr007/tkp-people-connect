import { Person } from '../../models/Person'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    const person = await Person.create({
      ...validated,
      createdBy: user.userId,
    })

    return { success: true, data: person }
  }
  catch (error) {
    handleApiError(error)
  }
})

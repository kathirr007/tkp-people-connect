import { calculateAgeFromDateOfBirth } from '@@/shared/utils/age-calculator'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const id = getRouterParam(event, 'id')!
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    // Calculate age from date of birth if date of birth is provided
    const dateOfBirth = validated.dateOfBirth
    const age = calculateAgeFromDateOfBirth(dateOfBirth)

    const person = await updatePerson(id, {
      ...validated,
      age, // Include calculated age
      fatherId: validated.fatherId || null,
      motherId: validated.motherId || null,
      spouseId: validated.spouseId || null,
      updatedBy: user.userId,
    })

    if (!person) {
      throw createError({ statusCode: 404, message: 'Person not found' })
    }

    return { success: true, data: person }
  }
  catch (error) {
    handleApiError(error)
  }
})

import { calculateAgeFromDateOfBirth } from '@@/shared/utils/age-calculator'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    // Calculate age from date of birth if date of birth is provided
    const dateOfBirth = validated.dateOfBirth
    const age = calculateAgeFromDateOfBirth(dateOfBirth)

    const person = await createPerson({
      ...validated,
      age, // Include calculated age
      fatherId: validated.fatherId || null,
      motherId: validated.motherId || null,
      spouseId: validated.spouseId || null,
      isAlive: validated.isAlive ?? true,
      isActive: validated.isActive ?? true,
      createdBy: user.userId,
    })

    return { success: true, data: person }
  }
  catch (error) {
    handleApiError(error)
  }
})

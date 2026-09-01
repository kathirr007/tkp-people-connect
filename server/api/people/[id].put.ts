import { calculateAgeFromDateOfBirth } from '@@/shared/utils/age-calculator'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const id = getRouterParam(event, 'id')!
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    // Clear spouse-related fields when marital status is single
    const dataToSave = validated.maritalStatus === 'single'
      ? {
          ...validated,
          spouseName: '',
          spousePhone: '',
          marriageYear: null,
          numberOfChildren: null,
          children: [],
        }
      : validated

    // Calculate age from date of birth if date of birth is provided
    const dateOfBirth = dataToSave.dateOfBirth
    const age = calculateAgeFromDateOfBirth(dateOfBirth)

    const person = await updatePerson(id, {
      ...dataToSave,
      age, // Include calculated age
      fatherId: dataToSave.fatherId || null,
      motherId: dataToSave.motherId || null,
      spouseId: dataToSave.spouseId || null,
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

import { calculateAgeFromDateOfBirth } from '@@/shared/utils/age-calculator'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const id = getRouterParam(event, 'id')!
    const body = await readBody(event)
    const validated = youthSchema.parse(body)

    // Calculate age from date of birth if date of birth is provided
    const dateOfBirth = validated.dateOfBirth
    const age = calculateAgeFromDateOfBirth(dateOfBirth)

    const record = await updateYouth(id, {
      ...validated,
      age, // Include calculated age
      educationDetails: JSON.stringify(validated.educationDetails || []),
      activities: JSON.stringify(validated.activities || []),
      achievements: JSON.stringify(validated.achievements || []),
      updatedBy: user.userId,
    })

    if (!record) {
      throw createError({ statusCode: 404, message: 'Youth record not found' })
    }

    return { success: true, data: record }
  }
  catch (error) {
    handleApiError(error)
  }
})

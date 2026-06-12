import { calculateAgeFromDateOfBirth } from '@@/shared/utils/age-calculator'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const body = await readBody(event)
    const validated = youthSchema.parse(body)

    // Calculate age from date of birth if date of birth is provided
    const dateOfBirth = validated.dateOfBirth
    const age = calculateAgeFromDateOfBirth(dateOfBirth)

    const youth = await createYouth({
      ...validated,
      age, // Include calculated age
      currentlyStudying: validated.currentlyStudying ?? true,
      educationDetails: JSON.stringify(validated.educationDetails || []),
      activities: JSON.stringify(validated.activities || []),
      achievements: JSON.stringify(validated.achievements || []),
      isActive: validated.isActive ?? true,
      createdBy: user.userId,
    })

    return { success: true, data: youth }
  }
  catch (error) {
    handleApiError(error)
  }
})

export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const body = await readBody(event)
    const validated = youthSchema.parse(body)

    const youth = await createYouth({
      ...validated,
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

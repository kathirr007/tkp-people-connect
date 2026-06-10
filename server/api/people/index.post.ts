export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    const person = await createPerson({
      ...validated,
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

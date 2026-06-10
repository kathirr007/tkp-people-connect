export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const id = getRouterParam(event, 'id')!
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    const person = await updatePerson(id, {
      ...validated,
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

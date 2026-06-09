export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin', 'user'])

  try {
    const id = getRouterParam(event, 'id')!
    const body = await readBody(event)
    const validated = personSchema.parse(body)

    const updateData = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email || null,
      phone: validated.phone || null,
      street: validated.address?.street || null,
      city: validated.address?.city || null,
      state: validated.address?.state || null,
      zipCode: validated.address?.zipCode || null,
      country: validated.address?.country || null,
      organization: validated.organization || null,
      designation: validated.designation || null,
      department: validated.department || null,
      notes: validated.notes || null,
      tags: validated.tags || [],
      isActive: validated.isActive ?? true,
      updatedBy: user.userId,
    }

    const person = await updatePerson(id, updateData)

    if (!person) {
      throw createError({
        statusCode: 404,
        message: 'Person not found',
      })
    }

    return { success: true, data: person }
  }
  catch (error) {
    handleApiError(error)
  }
})

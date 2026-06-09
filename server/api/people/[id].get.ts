export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')!

  const person = await findPersonById(id)
  if (!person) {
    throw createError({
      statusCode: 404,
      message: 'Person not found',
    })
  }

  // Format person with address object
  return {
    data: {
      _id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email || '',
      phone: person.phone || '',
      address: {
        street: person.street || '',
        city: person.city || '',
        state: person.state || '',
        zipCode: person.zipCode || '',
        country: person.country || '',
      },
      organization: person.organization || '',
      designation: person.designation || '',
      department: person.department || '',
      notes: person.notes || '',
      tags: person.tags ? JSON.parse(person.tags) : [],
      isActive: person.isActive,
      createdBy: person.createdBy,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    },
  }
})

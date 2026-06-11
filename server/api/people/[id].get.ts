export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const person = await findPersonById(id)

  if (!person) {
    throw createError({ statusCode: 404, message: 'Person not found' })
  }

  return { data: formatPersonResponse(person) }
})

function formatPersonResponse(person: any) {
  return {
    _id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    gender: person.gender || '',
    dateOfBirth: person.dateOfBirth || '',
    phone: person.phone || '',
    email: person.email || '',
    village: person.village || '',
    ward: person.ward || '',
    address: person.address || '',
    fatherName: person.fatherName || '',
    fatherPhone: person.fatherPhone || '',
    fatherId: person.fatherId || '',
    motherName: person.motherName || '',
    motherPhone: person.motherPhone || '',
    motherId: person.motherId || '',
    maritalStatus: person.maritalStatus || '',
    spouseName: person.spouseName || '',
    spousePhone: person.spousePhone || '',
    spouseId: person.spouseId || '',
    marriageYear: person.marriageYear || null,
    numberOfChildren: person.numberOfChildren ?? null,
    notes: person.notes || '',
    isAlive: person.isAlive,
    isActive: person.isActive,
    createdBy: person.createdBy,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  }
}

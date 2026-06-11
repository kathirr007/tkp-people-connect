export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const record = await findYouthById(id)

  if (!record) {
    throw createError({ statusCode: 404, message: 'Youth record not found' })
  }

  return { data: formatYouthResponse(record) }
})

function formatYouthResponse(record: any) {
  return {
    _id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    gender: record.gender || '',
    dateOfBirth: record.dateOfBirth || '',
    phone: record.phone || '',
    email: record.email || '',
    village: record.village || '',
    ward: record.ward || '',
    address: record.address || '',
    fatherName: record.fatherName || '',
    fatherPhone: record.fatherPhone || '',
    motherName: record.motherName || '',
    motherPhone: record.motherPhone || '',
    currentlyStudying: record.currentlyStudying,
    educationDetails: parseJsonField(record.educationDetails),
    activities: parseJsonField(record.activities),
    achievements: parseJsonField(record.achievements),
    interests: record.interests || '',
    careerGoal: record.careerGoal || '',
    bloodGroup: record.bloodGroup || '',
    notes: record.notes || '',
    isActive: record.isActive,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function parseJsonField(value: any): any[] {
  if (!value)
    return []
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

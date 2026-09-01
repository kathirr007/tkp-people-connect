export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)

  const records = await getAllYouthForExport({
    search: query.search as string | undefined,
    village: query.village as string | undefined,
  })

  const headers = ['First Name', 'Last Name', 'Gender', 'Date of Birth', 'Phone', 'Email', 'Village', 'Ward', 'Address', 'Father Name', 'Father Phone', 'Mother Name', 'Mother Phone', 'Currently Studying', 'Interests', 'Career Goal', 'Blood Group', 'Active']

  const rows = records.map(p => [
    p.firstName,
    p.lastName,
    p.gender || '',
    p.dateOfBirth || '',
    p.phone || '',
    p.email || '',
    p.village || '',
    p.ward || '',
    p.address || '',
    p.fatherName || '',
    p.fatherPhone || '',
    p.motherName || '',
    p.motherPhone || '',
    p.currentlyStudying ? 'Yes' : 'No',
    p.interests || '',
    p.careerGoal || '',
    p.bloodGroup || '',
    p.isActive ? 'Yes' : 'No',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  setResponseHeaders(event, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="youth-export.csv"',
  })

  return csvContent
})

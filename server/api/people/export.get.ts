export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)

  const people = await getAllPeopleForExport({
    search: query.search as string | undefined,
    organization: query.organization as string | undefined,
  })

  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Organization', 'Designation', 'Department', 'Street', 'City', 'State', 'Zip Code', 'Country', 'Tags', 'Active']

  const rows = people.map(p => [
    p.firstName,
    p.lastName,
    p.email || '',
    p.phone || '',
    p.organization || '',
    p.designation || '',
    p.department || '',
    p.address?.street || '',
    p.address?.city || '',
    p.address?.state || '',
    p.address?.zipCode || '',
    p.address?.country || '',
    (p.tags || []).join(';'),
    p.isActive ? 'Yes' : 'No',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  setResponseHeaders(event, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="people-export.csv"',
  })

  return csvContent
})

import { Person } from '../../models/Person'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)
  const filter: Record<string, unknown> = {}

  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: 'i' } },
      { lastName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { organization: { $regex: query.search, $options: 'i' } },
    ]
  }
  if (query.organization) {
    filter.organization = { $regex: query.organization, $options: 'i' }
  }

  const people = await Person.find(filter).lean()

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

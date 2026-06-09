import { Person } from '../../models/Person'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  try {
    const query = getQuery(event)
    const { page, limit, search, sortBy, sortOrder, organization, isActive } =
      paginationSchema.parse(query)

    const filter: Record<string, unknown> = {}

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ]
    }
    if (organization) {
      filter.organization = { $regex: organization, $options: 'i' }
    }
    if (isActive !== undefined) {
      filter.isActive = isActive
    }

    const skip = (page - 1) * limit
    const sort: Record<string, 1 | -1> = { [sortBy!]: sortOrder === 'asc' ? 1 : -1 }

    const [data, total] = await Promise.all([
      Person.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Person.countDocuments(filter),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

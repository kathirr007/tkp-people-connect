import { Person } from '../../models/Person'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const [totalPeople, activePeople, organizations, recentlyAdded, byOrganization] = await Promise.all([
    Person.countDocuments(),
    Person.countDocuments({ isActive: true }),
    Person.distinct('organization'),
    Person.find().sort({ createdAt: -1 }).limit(5).lean(),
    Person.aggregate([
      { $match: { organization: { $ne: '' } } },
      { $group: { _id: '$organization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ])

  return {
    totalPeople,
    activePeople,
    inactivePeople: totalPeople - activePeople,
    totalOrganizations: organizations.filter(Boolean).length,
    recentlyAdded,
    byOrganization: byOrganization.map((item: { _id: string, count: number }) => ({
      name: item._id,
      count: item.count,
    })),
  }
})

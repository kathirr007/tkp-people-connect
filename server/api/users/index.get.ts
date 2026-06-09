export default defineEventHandler(async (event) => {
  requireRole(event, ['admin'])

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const search = query.search as string | undefined

  return await listUsers({ page, limit, search })
})

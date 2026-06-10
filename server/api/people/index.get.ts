export default defineEventHandler(async (event) => {
  requireAuth(event)

  try {
    const query = getQuery(event)
    const { page, limit, search, sortBy, sortOrder, village, isActive } = paginationSchema.parse(query)

    const result = await listPeople({ page, limit, search, village, isActive, sortBy, sortOrder })

    return result
  }
  catch (error) {
    handleApiError(error)
  }
})

export default defineEventHandler(async (event) => {
  requireAuth(event)

  try {
    const query = getQuery(event)
    const { page, limit, search, sortBy, sortOrder, organization, isActive } =
      paginationSchema.parse(query)

    const result = await listPeople({
      page,
      limit,
      search,
      organization,
      isActive,
      sortBy,
      sortOrder,
    })

    return result
  }
  catch (error) {
    handleApiError(error)
  }
})

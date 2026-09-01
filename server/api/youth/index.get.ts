export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { page, limit, search, sortBy, sortOrder, village, isActive } = paginationSchema.parse(query)

    const currentlyStudying = query.currentlyStudying === 'true' ? true : query.currentlyStudying === 'false' ? false : undefined

    const result = await listYouth({ page, limit, search, village, isActive, currentlyStudying, sortBy, sortOrder })

    return result
  }
  catch (error) {
    handleApiError(error)
  }
})

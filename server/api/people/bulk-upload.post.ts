export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['admin'])

  try {
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded',
      })
    }

    const file = formData[0]
    if (!file.data || !file.filename) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file',
      })
    }

    const rows = await detectFormatAndParse(
      file.data,
      file.filename,
      file.type,
    )

    if (rows.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'File contains no data',
      })
    }

    if (rows.length > 10000) {
      throw createError({
        statusCode: 400,
        message: 'File exceeds maximum of 10,000 rows',
      })
    }

    const results = { success: 0, failed: 0, errors: [] as string[] }
    const validPeople: Record<string, unknown>[] = []

    for (let i = 0; i < rows.length; i++) {
      const result = personSchema.safeParse(rows[i])
      if (result.success) {
        validPeople.push({
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email || null,
          phone: result.data.phone || null,
          street: result.data.address?.street || null,
          city: result.data.address?.city || null,
          state: result.data.address?.state || null,
          zipCode: result.data.address?.zipCode || null,
          country: result.data.address?.country || null,
          organization: result.data.organization || null,
          designation: result.data.designation || null,
          department: result.data.department || null,
          notes: result.data.notes || null,
          tags: result.data.tags || [],
          isActive: result.data.isActive ?? true,
          createdBy: user.userId,
        })
        results.success++
      }
      else {
        results.failed++
        const firstError = result.error.issues[0]
        results.errors.push(`Row ${i + 1}: ${firstError.path.join('.')} - ${firstError.message}`)
      }
    }

    if (validPeople.length > 0) {
      await insertManyPeople(validPeople)
    }

    return {
      success: true,
      results: {
        total: rows.length,
        ...results,
      },
    }
  }
  catch (error) {
    handleApiError(error)
  }
})

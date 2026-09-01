import { detectDuplicates } from '../../utils/duplicate-detector'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { records, type } = body as { records?: Record<string, unknown>[], type?: 'people' | 'youth' }

  if (!records || !Array.isArray(records) || records.length === 0) {
    throw createError({ statusCode: 400, message: 'Records array is required' })
  }

  if (records.length > 1000) {
    throw createError({ statusCode: 400, message: 'Maximum 1000 records per duplicate check' })
  }

  try {
    const duplicates = await detectDuplicates(records, type || 'people')
    return {
      duplicates,
      totalChecked: records.length,
    }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('No AI provider available') || message.includes('embedding provider')) {
      throw createError({
        statusCode: 503,
        message: 'AI provider not available for duplicate detection.',
      })
    }
    throw createError({ statusCode: 500, message })
  }
})

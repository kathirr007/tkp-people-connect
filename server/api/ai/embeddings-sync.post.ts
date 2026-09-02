import { listPeople, listYouth } from '../../utils/db'
import { embedRecords, getStoredEmbeddingCount } from '../../utils/embeddings'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  try {
    // Fetch all records from both tables
    const peopleResult = await listPeople({ page: 1, limit: 10000 })
    const youthResult = await listYouth({ page: 1, limit: 10000 })

    const records: Array<{ id: string, type: 'people' | 'youth', data: Record<string, unknown> }> = []

    for (const person of peopleResult.data) {
      records.push({ id: person._id, type: 'people', data: person as unknown as Record<string, unknown> })
    }

    for (const youth of youthResult.data) {
      records.push({ id: youth._id, type: 'youth', data: youth as unknown as Record<string, unknown> })
    }

    if (records.length === 0) {
      return { success: true, message: 'No records to embed', totalEmbedded: 0, previousCount: getStoredEmbeddingCount() }
    }

    const previousCount = getStoredEmbeddingCount()
    const { embedded, failed } = await embedRecords(records)

    return {
      success: embedded > 0,
      message: failed > 0
        ? `Embedded ${embedded} records (${failed} failed)`
        : `Successfully embedded ${embedded} records`,
      totalEmbedded: embedded,
      previousCount,
    }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('No AI provider available') || message.includes('embedding provider')) {
      throw createError({
        statusCode: 503,
        message: 'AI provider not available. Install Ollama or configure GEMINI_API_KEY.',
      })
    }
    throw createError({ statusCode: 500, message })
  }
})

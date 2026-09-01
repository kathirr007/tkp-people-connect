import { findPersonById, findYouthById, textSearchPeople, textSearchYouth } from '../../utils/db'
import { getStoredEmbeddingCount, searchEmbeddings } from '../../utils/embeddings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { query, type = 'all', limit = 20 } = body as { query?: string, type?: 'people' | 'youth' | 'all', limit?: number }

  if (!query || typeof query !== 'string') {
    throw createError({ statusCode: 400, message: 'Query is required' })
  }

  const startTime = Date.now()

  try {
    const totalIndexed = getStoredEmbeddingCount()
    let matches: Array<{ id: string, type: 'people' | 'youth', score: number, data?: Record<string, unknown> }>
    let usedFallback = false

    if (totalIndexed > 0) {
      matches = await searchEmbeddings(query, type, limit)
    }
    else {
      usedFallback = true
      const peopleResults = type === 'youth' ? [] : await textSearchPeople(query, limit)
      const youthResults = type === 'people' ? [] : await textSearchYouth(query, limit)
      matches = [...peopleResults, ...youthResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    }

    // Fetch full record data for each match (skip if fallback already provided data)
    const results = await Promise.all(
      matches.map(async (match) => {
        if (usedFallback && match.data)
          return match
        let data: Record<string, unknown> | undefined
        if (match.type === 'people') {
          const person = await findPersonById(match.id)
          if (person)
            data = person as unknown as Record<string, unknown>
        }
        else {
          const youth = await findYouthById(match.id)
          if (youth)
            data = youth as unknown as Record<string, unknown>
        }
        return { ...match, data: data || {} }
      }),
    )

    return {
      results,
      queryTime: Date.now() - startTime,
      totalIndexed,
      fallback: usedFallback,
    }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('No AI provider available') || message.includes('embedding provider')) {
      throw createError({
        statusCode: 503,
        message: 'AI provider not available. Run embeddings sync first or install Ollama.',
      })
    }
    throw createError({ statusCode: 500, message })
  }
})

import { naturalLanguageQuery } from '../../utils/nl-query'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const body = await readBody(event)
  const { query } = body as { query?: string }

  if (!query || typeof query !== 'string') {
    throw createError({ statusCode: 400, message: 'Query is required' })
  }

  if (query.length > 500) {
    throw createError({ statusCode: 400, message: 'Query too long (max 500 characters)' })
  }

  try {
    return await naturalLanguageQuery(query)
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('No AI provider available')) {
      throw createError({
        statusCode: 503,
        message: 'AI provider not available. Install Ollama or configure GEMINI_API_KEY.',
      })
    }
    throw createError({ statusCode: 500, message })
  }
})

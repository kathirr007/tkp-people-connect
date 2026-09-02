import { getAiClientByName } from '../../utils/ai/client'
import { classifyQuery, FORMAT_CONTEXT, SCHEMA_CONTEXT, WEB_SEARCH_FORMAT_CONTEXT } from '../../utils/nl-query'
import { formatWebSearchContext, webSearch } from '../../utils/web-search'

function sendSSE(event: any, data: Record<string, unknown>): void {
  event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
}

async function streamOrComplete(client: any, prompt: string, systemPrompt: string, event: any, type: string): Promise<string> {
  let text = ''
  if (client.chatCompletionStream) {
    for await (const chunk of client.chatCompletionStream(prompt, systemPrompt)) {
      text += chunk
      sendSSE(event, { type, content: chunk })
    }
  }
  else {
    text = await client.chatCompletion(prompt, systemPrompt)
    sendSSE(event, { type, content: text })
  }
  return text
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const body = await readBody(event)
  const { query, provider = 'auto', queryMode = 'auto' } = body as {
    query?: string
    provider?: string
    queryMode?: string
  }

  if (!query || typeof query !== 'string') {
    throw createError({ statusCode: 400, message: 'Query is required' })
  }

  if (query.length > 500) {
    throw createError({ statusCode: 400, message: 'Query too long (max 500 characters)' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  try {
    const client = await getAiClientByName(provider)
    // Step 1: Determine query type — use user selection or fall back to classification
    sendSSE(event, { type: 'status', message: 'Analyzing your question...' })

    const queryType = (queryMode && queryMode !== 'auto')
      ? queryMode
      : classifyQuery(query)
    sendSSE(event, { type: 'classified', queryType, provider: client.name })

    // Declare webResults in outer scope so it's accessible across both blocks
    let webResults: Awaited<ReturnType<typeof webSearch>> | null = null

    // Step 2: Route based on classification
    if (queryType === 'web' || queryType === 'both') {
      // Web search
      sendSSE(event, { type: 'status', message: 'Searching the web...' })

      try {
        webResults = await webSearch(query)
      }
      catch {
        webResults = { query, results: [], abstract: '', answer: '' }
      }

      sendSSE(event, { type: 'web-results', results: webResults.results.slice(0, 5) })

      if (queryType === 'web') {
        // Web only — format answer from search results
        sendSSE(event, { type: 'status', message: 'Generating answer...' })

        const searchContext = formatWebSearchContext(webResults)
        const answer = await streamOrComplete(
          client,
          `Original question: "${query}"\n\nWeb search results:\n${searchContext}`,
          WEB_SEARCH_FORMAT_CONTEXT,
          event,
          'answer-chunk',
        )

        sendSSE(event, {
          type: 'complete',
          answer,
          source: 'web',
          webResults: webResults.results.slice(0, 5),
        })
        return
      }
    }

    if (queryType === 'database' || queryType === 'both') {
      // Database query
      sendSSE(event, { type: 'status', message: 'Generating SQL query...' })

      let sql = ''
      if (client.chatCompletionStream) {
        for await (const chunk of client.chatCompletionStream(
          `Convert this question to a SQL query:\n\n"${query}"`,
          SCHEMA_CONTEXT,
        )) {
          sql += chunk
          sendSSE(event, { type: 'sql-chunk', content: chunk })
        }
      }
      else {
        sql = await client.chatCompletion(
          `Convert this question to a SQL query:\n\n"${query}"`,
          SCHEMA_CONTEXT,
        )
      }

      // Validate the SQL
      const cleanedSql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
      if (!cleanedSql.toUpperCase().startsWith('SELECT')) {
        throw new Error('Only SELECT queries are allowed')
      }

      const blocked = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC']
      const upperSql = cleanedSql.toUpperCase()
      for (const keyword of blocked) {
        if (upperSql.includes(keyword)) {
          throw new Error(`Blocked keyword detected: ${keyword}`)
        }
      }

      sendSSE(event, { type: 'sql-ready', sql: cleanedSql })

      // Execute the SQL query
      sendSSE(event, { type: 'status', message: 'Executing query against database...' })

      const { useDatabase } = await import('../../database')
      const database = useDatabase()

      let data: Record<string, unknown>[] = []
      try {
        if (database.driver === 'sqlite') {
          data = database.rawClient.prepare(cleanedSql).all() as Record<string, unknown>[]
        }
        else {
          data = await database.rawClient.unsafe(cleanedSql) as Record<string, unknown>[]
        }
      }
      catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`SQL execution failed: ${message}`)
      }

      sendSSE(event, { type: 'results-ready', rowCount: data.length })

      // Format results into natural language (streaming)
      sendSSE(event, { type: 'status', message: 'Analyzing results...' })

      const formatPrompt = `Original question: "${query}"\n\nSQL query: ${cleanedSql}\n\nResults (${data.length} rows):\n${JSON.stringify(data.slice(0, 50), null, 2)}`
      const answer = await streamOrComplete(client, formatPrompt, FORMAT_CONTEXT, event, 'answer-chunk')

      // If "both" and web results have useful content, combine them
      let finalAnswer = answer
      const hasWebContent = webResults && (webResults.results.length > 0 || webResults.abstract || webResults.answer)
      if (queryType === 'both' && hasWebContent) {
        const searchContext = formatWebSearchContext(webResults!)
        sendSSE(event, { type: 'status', message: 'Combining database and web results...' })
        finalAnswer = await streamOrComplete(
          client,
          `Original question: "${query}"\n\nDatabase answer: ${answer}\n\nAdditional web search context:\n${searchContext}\n\nProvide a combined, concise answer.`,
          WEB_SEARCH_FORMAT_CONTEXT,
          event,
          'answer-chunk',
        )
      }

      sendSSE(event, {
        type: 'complete',
        answer: finalAnswer,
        sql: cleanedSql,
        rowCount: data.length,
        source: queryType === 'both' ? 'both' : 'database',
        webResults: webResults ? webResults.results.slice(0, 5) : undefined,
      })
    }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('No AI provider available')) {
      sendSSE(event, { type: 'error', message: 'AI provider not available. Install Ollama or configure GEMINI_API_KEY.' })
    }
    else if (message.includes('API_KEY is required')) {
      sendSSE(event, { type: 'error', message: `${message} — add it to your .env file and restart the server.` })
    }
    else if (message === 'Connection error.' || message.toLowerCase().includes('connection error')) {
      sendSSE(event, { type: 'error', message: `Could not connect to the ${provider} API. Check your API key is valid and your network allows outbound HTTPS to the provider.` })
    }
    else {
      sendSSE(event, { type: 'error', message })
    }
  }
  finally {
    event.node.res.end()
  }
})

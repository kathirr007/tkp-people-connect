export interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sql?: string
  rowCount?: number
  timestamp: Date
  isStreaming?: boolean
  source?: 'database' | 'web' | 'both'
  webResults?: WebSearchResult[]
}

export function useAiQuery() {
  const messages = ref<ChatMessage[]>([])
  const isQuerying = ref(false)
  const error = ref<string | null>(null)
  const currentStatus = ref<string | null>(null)

  async function sendQuery(query: string) {
    if (!query.trim())
      return

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    // Create placeholder for streaming assistant message
    const assistantId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    messages.value.push(assistantMessage)

    isQuerying.value = true
    error.value = null
    currentStatus.value = 'Analyzing your question...'

    try {
      // Use native fetch for streaming (ofetch/$fetch buffers)
      const response = await fetch('/api/ai/query-stream', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.message || `Request failed with status ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: '))
            continue

          try {
            const data = JSON.parse(line.slice(6))
            handleStreamEvent(data, assistantMessage)
          }
          catch {
            // Skip malformed events
          }
        }
      }
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err?.data?.message || err?.message || 'Query failed'
      // Remove the empty assistant message on error
      const idx = messages.value.findIndex(m => m.id === assistantId)
      if (idx !== -1)
        messages.value.splice(idx, 1)
    }
    finally {
      isQuerying.value = false
      currentStatus.value = null
    }
  }

  function handleStreamEvent(data: Record<string, unknown>, assistantMessage: ChatMessage) {
    switch (data.type) {
      case 'status':
        currentStatus.value = data.message as string
        break

      case 'classified': {
        const qType = data.queryType as string
        if (qType === 'web')
          currentStatus.value = 'Web search needed...'
        else if (qType === 'both')
          currentStatus.value = 'Needs database + web search...'
        else
          currentStatus.value = 'Database query...'
        break
      }

      case 'sql-chunk':
        break

      case 'sql-ready':
        assistantMessage.sql = data.sql as string
        currentStatus.value = 'Executing query against database...'
        break

      case 'results-ready':
        assistantMessage.rowCount = data.rowCount as number
        currentStatus.value = 'Analyzing results...'
        break

      case 'web-results':
        assistantMessage.webResults = data.results as WebSearchResult[]
        currentStatus.value = 'Generating answer from web results...'
        break

      case 'answer-chunk':
        assistantMessage.content += data.content as string
        messages.value = [...messages.value]
        break

      case 'complete':
        assistantMessage.content = data.answer as string
        assistantMessage.sql = data.sql as string
        assistantMessage.rowCount = data.rowCount as number
        assistantMessage.source = data.source as string
        assistantMessage.webResults = data.webResults as WebSearchResult[] | undefined
        assistantMessage.isStreaming = false
        messages.value = [...messages.value]
        break

      case 'error': {
        error.value = data.message as string
        // Only remove the placeholder if nothing was streamed yet
        if (!assistantMessage.content) {
          const idx = messages.value.findIndex(m => m.id === assistantMessage.id)
          if (idx !== -1)
            messages.value.splice(idx, 1)
        }
        else {
          assistantMessage.isStreaming = false
          messages.value = [...messages.value]
        }
        break
      }
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = null
    currentStatus.value = null
  }

  return {
    messages,
    isQuerying,
    error,
    currentStatus,
    sendQuery,
    clearMessages,
  }
}

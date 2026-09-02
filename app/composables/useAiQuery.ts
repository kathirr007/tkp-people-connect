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
  // shallowRef avoids deep reactive wrapping of every message object;
  // triggerRef() is used to notify watchers after mutations.
  const messages = shallowRef<ChatMessage[]>([])
  const isQuerying = ref(false)
  const error = ref<string | null>(null)
  const currentStatus = ref<string | null>(null)
  const selectedProvider = ref('auto')
  const selectedQueryMode = ref('auto')

  let abortController: AbortController | null = null

  async function sendQuery(query: string) {
    if (!query.trim())
      return

    // Cancel any in-flight request before starting a new one
    abortController?.abort()
    abortController = new AbortController()

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    const assistantId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    messages.value.push(assistantMessage)
    triggerRef(messages)

    isQuerying.value = true
    error.value = null
    currentStatus.value = 'Analyzing your question...'

    try {
      const response = await fetch('/api/ai/query-stream', {
        method: 'POST',
        body: JSON.stringify({ query, provider: selectedProvider.value, queryMode: selectedQueryMode.value }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        signal: abortController.signal,
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
      // AbortError means the user cancelled — preserve any partial content
      if ((e as Error)?.name === 'AbortError') {
        if (!assistantMessage.content) {
          const idx = messages.value.findIndex(m => m.id === assistantId)
          if (idx !== -1)
            messages.value.splice(idx, 1)
        }
        else {
          assistantMessage.isStreaming = false
        }
        triggerRef(messages)
        return
      }
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err?.data?.message || err?.message || 'Query failed'
      const idx = messages.value.findIndex(m => m.id === assistantId)
      if (idx !== -1)
        messages.value.splice(idx, 1)
      triggerRef(messages)
    }
    finally {
      abortController = null
      isQuerying.value = false
      currentStatus.value = null
    }
  }

  function cancelQuery() {
    abortController?.abort()
    abortController = null
  }

  function handleStreamEvent(data: Record<string, unknown>, assistantMessage: ChatMessage) {
    switch (data.type) {
      case 'status':
        currentStatus.value = data.message as string
        break

      case 'classified': {
        const qType = data.queryType as string
        const prov = data.provider as string | undefined
        const provLabel = prov ? ` via ${prov}` : ''
        if (qType === 'web')
          currentStatus.value = `Web search${provLabel}...`
        else if (qType === 'both')
          currentStatus.value = `Database + web${provLabel}...`
        else
          currentStatus.value = `Database query${provLabel}...`
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
        triggerRef(messages)
        break

      case 'complete':
        assistantMessage.content = data.answer as string
        assistantMessage.sql = data.sql as string
        assistantMessage.rowCount = data.rowCount as number
        assistantMessage.source = data.source as string
        assistantMessage.webResults = data.webResults as WebSearchResult[] | undefined
        assistantMessage.isStreaming = false
        triggerRef(messages)
        break

      case 'error': {
        error.value = data.message as string
        if (!assistantMessage.content) {
          const idx = messages.value.findIndex(m => m.id === assistantMessage.id)
          if (idx !== -1)
            messages.value.splice(idx, 1)
        }
        else {
          assistantMessage.isStreaming = false
        }
        triggerRef(messages)
        break
      }
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = null
    currentStatus.value = null
    triggerRef(messages)
  }

  return {
    messages,
    isQuerying,
    error,
    currentStatus,
    selectedProvider,
    selectedQueryMode,
    sendQuery,
    cancelQuery,
    clearMessages,
  }
}

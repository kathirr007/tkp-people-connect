import type { AiQueryResponse } from '~~/shared/types/ai'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sql?: string
  rowCount?: number
  timestamp: Date
}

export function useAiQuery() {
  const messages = ref<ChatMessage[]>([])
  const isQuerying = ref(false)
  const error = ref<string | null>(null)

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

    isQuerying.value = true
    error.value = null

    try {
      const response = await $fetch<AiQueryResponse>('/api/ai/query', {
        method: 'POST',
        body: { query },
      })

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        sql: response.sql,
        rowCount: response.rowCount,
        timestamp: new Date(),
      }
      messages.value.push(assistantMessage)
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err?.data?.message || err?.message || 'Query failed'
    }
    finally {
      isQuerying.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    isQuerying,
    error,
    sendQuery,
    clearMessages,
  }
}

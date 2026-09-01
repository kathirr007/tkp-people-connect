import type { AiProviderInfo, AiSearchResponse } from '~~/shared/types/ai'

export function useAiSearch() {
  const results = ref<AiSearchResponse | null>(null)
  const isSearching = ref(false)
  const error = ref<string | null>(null)
  const provider = ref<AiProviderInfo | null>(null)
  const isSyncing = ref(false)

  async function fetchProvider() {
    try {
      provider.value = await $fetch<AiProviderInfo>('/api/ai/provider')
    }
    catch {
      provider.value = null
    }
  }

  async function search(query: string, type: 'people' | 'youth' | 'all' = 'all', limit = 20) {
    if (!query.trim()) {
      results.value = null
      return
    }

    isSearching.value = true
    error.value = null

    try {
      const response = await $fetch<AiSearchResponse>('/api/ai/search', {
        method: 'POST',
        body: { query, type, limit },
      })
      results.value = response
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err?.data?.message || err?.message || 'Search failed'
      results.value = null
    }
    finally {
      isSearching.value = false
    }
  }

  async function syncEmbeddings() {
    isSyncing.value = true
    try {
      const response = await $fetch<{ success: boolean, totalEmbedded: number, message: string }>('/api/ai/embeddings-sync', {
        method: 'POST',
      })
      return response
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      throw new Error(err?.data?.message || err?.message || 'Sync failed')
    }
    finally {
      isSyncing.value = false
    }
  }

  return {
    results,
    isSearching,
    error,
    provider,
    isSyncing,
    fetchProvider,
    search,
    syncEmbeddings,
  }
}

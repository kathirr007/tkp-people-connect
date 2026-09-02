export interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

export interface WebSearchResponse {
  query: string
  results: WebSearchResult[]
  abstract: string
  answer: string
}

export async function webSearch(query: string, limit = 5): Promise<WebSearchResponse> {
  const encoded = encodeURIComponent(query)
  const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`

  const response = await fetch(url, {
    headers: { 'User-Agent': 'TKP-People-Connect/1.0' },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Web search failed: ${response.status}`)
  }

  const data = await response.json()

  const results: WebSearchResult[] = []

  // Abstract (main answer)
  const abstract = data.AbstractText || ''
  const answer = data.Answer || ''

  // Related topics
  if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics) {
      if (results.length >= limit)
        break

      // Direct answer topic
      if (topic.Text) {
        results.push({
          title: topic.Text.slice(0, 100),
          url: topic.FirstURL || '',
          snippet: topic.Text,
        })
      }

      // Sub-topics
      if (topic.Topics && Array.isArray(topic.Topics)) {
        for (const sub of topic.Topics) {
          if (results.length >= limit)
            break
          if (sub.Text) {
            results.push({
              title: sub.Text.slice(0, 100),
              url: sub.FirstURL || '',
              snippet: sub.Text,
            })
          }
        }
      }
    }
  }

  return { query, results, abstract, answer }
}

export function formatWebSearchContext(search: WebSearchResponse): string {
  const parts: string[] = []

  if (search.answer) {
    parts.push(`Answer: ${search.answer}`)
  }
  if (search.abstract) {
    parts.push(`Summary: ${search.abstract}`)
  }
  if (search.results.length > 0) {
    parts.push('Search results:')
    for (const r of search.results) {
      parts.push(`- ${r.title}: ${r.snippet}`)
    }
  }

  return parts.join('\n') || 'No web search results found.'
}

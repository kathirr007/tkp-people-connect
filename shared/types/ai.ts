export type AiProvider = 'ollama' | 'gemini' | 'groq'

export interface AiProviderInfo {
  name: AiProvider
  available: boolean
  embeddingModel: string | null
  chatModel: string
  embeddingDimensions: number
}

export interface EmbeddingVector {
  id: string
  type: 'people' | 'youth'
  vector: number[]
  text: string
}

export interface SearchResult {
  id: string
  type: 'people' | 'youth'
  score: number
  data: Record<string, unknown>
}

export interface DuplicateMatch {
  row: number
  score: number
  severity: 'likely' | 'possible'
  matchedId: string
  matchedName: string
  matchedType: 'people' | 'youth'
}

export interface AiSearchResponse {
  results: SearchResult[]
  queryTime: number
  totalIndexed: number
}

export interface AiDuplicateResponse {
  duplicates: DuplicateMatch[]
  totalChecked: number
}

export interface AiQueryResponse {
  answer: string
  sql: string
  rowCount: number
  data: Record<string, unknown>[]
}

export interface AiEmailDraft {
  subject: string
  body: string
  htmlBody: string
}

export type AiEmailType = 'welcome' | 'event' | 'followup' | 'custom'

export interface AiEmailRequest {
  personId: string
  personType: 'people' | 'youth'
  emailType: AiEmailType
  customContext?: string
  subject?: string
}

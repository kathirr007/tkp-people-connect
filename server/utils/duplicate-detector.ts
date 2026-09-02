import type { DuplicateMatch } from '~~/shared/types/ai'
import { getEmbeddingClient } from './ai/client'
import { cosineSimilarity, getStoredEmbeddings } from './embeddings'

const LIKELY_THRESHOLD = 0.85
const POSSIBLE_THRESHOLD = 0.70

export async function detectDuplicates(
  records: Array<{ firstName?: string, lastName?: string, [key: string]: unknown }>,
  type: 'people' | 'youth',
): Promise<DuplicateMatch[]> {
  const stored = getStoredEmbeddings()
  if (stored.length === 0)
    return []

  const client = await getEmbeddingClient()
  const duplicates: DuplicateMatch[] = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const text = buildRecordText(record, type)
    if (!text.trim())
      continue

    try {
      const queryVector = await client.generateEmbedding(text)

      let bestScore = 0
      let bestMatch: DuplicateMatch | null = null

      for (const entry of stored) {
        if (entry.type !== type)
          continue
        const score = cosineSimilarity(queryVector, entry.vector)
        if (score > bestScore) {
          bestScore = score
          bestMatch = {
            row: i + 1,
            score,
            severity: score >= LIKELY_THRESHOLD ? 'likely' : 'possible',
            matchedId: entry.id,
            matchedName: extractName(entry.text),
            matchedType: entry.type,
          }
        }
      }

      if (bestMatch && bestScore >= POSSIBLE_THRESHOLD) {
        duplicates.push(bestMatch)
      }
    }
    catch {
      // Skip embedding failures
    }
  }

  return duplicates
}

function buildRecordText(record: Record<string, unknown>, type: 'people' | 'youth'): string {
  const parts: string[] = []
  if (record.firstName)
    parts.push(String(record.firstName))
  if (record.lastName)
    parts.push(String(record.lastName))
  if (record.gender)
    parts.push(String(record.gender))
  if (record.village)
    parts.push(`village:${record.village}`)
  if (record.dateOfBirth)
    parts.push(`dob:${record.dateOfBirth}`)
  if (record.phone)
    parts.push(`phone:${record.phone}`)
  if (record.email)
    parts.push(`email:${record.email}`)
  if (type === 'youth' && record.interests)
    parts.push(`interests:${record.interests}`)
  return parts.filter(Boolean).join(' ')
}

function extractName(text: string): string {
  return text.split(' ').slice(0, 2).join(' ')
}

import type { EmbeddingVector } from '~~/shared/types/ai'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { getEmbeddingClient } from './ai/client'

const EMBEDDINGS_FILE = join(process.cwd(), 'data', 'embeddings.json')

let _store: Map<string, EmbeddingVector> | null = null

function loadStore(): Map<string, EmbeddingVector> {
  if (_store)
    return _store
  _store = new Map()

  if (existsSync(EMBEDDINGS_FILE)) {
    try {
      const raw = readFileSync(EMBEDDINGS_FILE, 'utf-8')
      const data: EmbeddingVector[] = JSON.parse(raw)
      for (const item of data) {
        _store.set(`${item.type}:${item.id}`, item)
      }
      console.warn(`[Embeddings] Loaded ${_store.size} embeddings from disk`)
    }
    catch {
      console.warn('[Embeddings] Failed to load embeddings file, starting fresh')
    }
  }

  return _store
}

function saveStore(): void {
  if (!_store)
    return
  try {
    const data = Array.from(_store.values())
    writeFileSync(EMBEDDINGS_FILE, JSON.stringify(data, null, 2))
  }
  catch {
    console.error('[Embeddings] Failed to save embeddings to disk')
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length)
    return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0)
    return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

function buildRecordText(record: Record<string, unknown>, type: 'people' | 'youth'): string {
  const parts: string[] = []
  const firstName = String(record.firstName || record.first_name || '')
  const lastName = String(record.lastName || record.last_name || '')
  if (firstName)
    parts.push(firstName)
  if (lastName)
    parts.push(lastName)
  if (record.gender)
    parts.push(String(record.gender))
  if (record.village)
    parts.push(`village:${record.village}`)
  if (record.ward)
    parts.push(`ward:${record.ward}`)
  if (record.phone)
    parts.push(`phone:${record.phone}`)
  if (record.email)
    parts.push(`email:${record.email}`)
  if (record.fatherName || record.father_name)
    parts.push(`father:${record.fatherName || record.father_name}`)
  if (record.motherName || record.mother_name)
    parts.push(`mother:${record.motherName || record.mother_name}`)

  if (type === 'people') {
    if (record.maritalStatus || record.marital_status)
      parts.push(`status:${record.maritalStatus || record.marital_status}`)
    if (record.dateOfBirth || record.date_of_birth)
      parts.push(`dob:${record.dateOfBirth || record.date_of_birth}`)
    if (record.age)
      parts.push(`age:${record.age}`)
    if (Array.isArray(record.education) && record.education.length) {
      for (const edu of record.education) {
        parts.push(`education:${edu.level || ''} ${edu.institution || ''}`)
      }
    }
  }

  if (type === 'youth') {
    if (record.dateOfBirth || record.date_of_birth)
      parts.push(`dob:${record.dateOfBirth || record.date_of_birth}`)
    if (record.age)
      parts.push(`age:${record.age}`)
    if (record.currentlyStudying || record.currently_studying)
      parts.push('currently studying')
    if (record.interests)
      parts.push(`interests:${record.interests}`)
    if (record.careerGoal || record.career_goal)
      parts.push(`career goal:${record.careerGoal || record.career_goal}`)
    if (record.bloodGroup || record.blood_group)
      parts.push(`blood:${record.bloodGroup || record.blood_group}`)
    if (Array.isArray(record.activities) && record.activities.length) {
      for (const act of record.activities) {
        parts.push(`activity:${act.name || ''} ${act.type || ''} ${act.proficiency || ''}`)
      }
    }
    if (Array.isArray(record.achievements) && record.achievements.length) {
      for (const ach of record.achievements) {
        parts.push(`achievement:${ach.title || ''} ${ach.category || ''} ${ach.level || ''}`)
      }
    }
    if (Array.isArray(record.educationDetails || record.education_details) && (record.educationDetails || record.education_details).length) {
      for (const edu of (record.educationDetails || record.education_details) as Record<string, unknown>[]) {
        parts.push(`education:${edu.level || ''} ${edu.institution || ''} ${edu.course || ''}`)
      }
    }
  }

  return parts.filter(Boolean).join(' ')
}

export async function embedRecord(id: string, type: 'people' | 'youth', record: Record<string, unknown>): Promise<void> {
  const store = loadStore()
  const text = buildRecordText(record, type)
  if (!text.trim())
    return

  const client = await getEmbeddingClient()
  const vector = await client.generateEmbedding(text)

  store.set(`${type}:${id}`, { id, type, vector, text })
  saveStore()
}

export async function embedRecords(records: Array<{ id: string, type: 'people' | 'youth', data: Record<string, unknown> }>): Promise<{ embedded: number, failed: number }> {
  const store = loadStore()
  const client = await getEmbeddingClient()
  let embedded = 0
  let failed = 0

  for (const record of records) {
    const text = buildRecordText(record.data, record.type)
    if (!text.trim())
      continue

    try {
      const vector = await client.generateEmbedding(text)
      store.set(`${record.type}:${record.id}`, { id: record.id, type: record.type, vector, text })
      embedded++
    }
    catch (err) {
      failed++
      console.warn(`[Embeddings] Failed to embed ${record.type}:${record.id}:`, err instanceof Error ? err.message : err)
    }
  }

  saveStore()
  return { embedded, failed }
}

export function getStoredEmbeddings(): EmbeddingVector[] {
  const store = loadStore()
  return Array.from(store.values())
}

export function getStoredEmbeddingCount(): number {
  const store = loadStore()
  return store.size
}

export function removeEmbedding(id: string, type: 'people' | 'youth'): void {
  const store = loadStore()
  store.delete(`${type}:${id}`)
  saveStore()
}

export async function searchEmbeddings(query: string, type: 'people' | 'youth' | 'all' = 'all', limit = 20): Promise<Array<{ id: string, type: 'people' | 'youth', score: number }>> {
  const store = loadStore()
  if (store.size === 0)
    return []

  const client = await getEmbeddingClient()
  const queryVector = await client.generateEmbedding(query)

  const results: Array<{ id: string, type: 'people' | 'youth', score: number }> = []

  for (const [, entry] of store) {
    if (type !== 'all' && entry.type !== type)
      continue
    const score = cosineSimilarity(queryVector, entry.vector)
    if (score > 0.3) {
      results.push({ id: entry.id, type: entry.type, score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}

export function rebuildStore(): void {
  _store = null
  loadStore()
}

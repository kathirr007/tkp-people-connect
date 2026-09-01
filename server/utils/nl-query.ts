import type { AiQueryResponse } from '~~/shared/types/ai'
import { getAiClient } from './ai/client'

export const SCHEMA_CONTEXT = `You are a SQL expert for a people management database. Generate PostgreSQL-compatible SQL queries.

Tables:
- people (id TEXT PK, first_name TEXT, last_name TEXT, gender TEXT, date_of_birth TEXT, age INTEGER, phone TEXT, email TEXT, village TEXT, ward TEXT, address TEXT, father_name TEXT, father_phone TEXT, mother_name TEXT, mother_phone TEXT, marital_status TEXT, spouse_name TEXT, is_alive INTEGER, is_active INTEGER, created_at TEXT)
- youth (id TEXT PK, first_name TEXT, last_name TEXT, gender TEXT, date_of_birth TEXT, age INTEGER, phone TEXT, email TEXT, village TEXT, ward TEXT, address TEXT, father_name TEXT, mother_name TEXT, currently_studying INTEGER, interests TEXT, career_goal TEXT, blood_group TEXT, is_active INTEGER, created_at TEXT)
- users (id TEXT PK, username TEXT, email TEXT, first_name TEXT, last_name TEXT, role TEXT, is_verified INTEGER, created_at TEXT)

Rules:
- ONLY generate SELECT queries. Never INSERT, UPDATE, DELETE, DROP, ALTER, or CREATE.
- Use the correct table and column names as specified above.
- For age comparisons, use the age column directly.
- For boolean fields (is_active, is_alive, currently_studying), compare with 1 (true) or 0 (false).
- Return only the SQL query, no explanations or markdown formatting.`

export const FORMAT_CONTEXT = `You are a helpful assistant that converts database query results into natural language answers.

Given the original question and the SQL query results, provide a clear, concise answer in natural language. Include relevant numbers and details from the results. If the results are empty, say so clearly.`

export const WEB_SEARCH_FORMAT_CONTEXT = `You are a helpful assistant that answers questions using web search results.

Given the original question and web search results, provide a clear, concise answer in natural language. Use bullet points or numbered lists when appropriate. Cite sources when possible.`

export type QueryClassification = 'database' | 'web' | 'both'

const DB_KEYWORDS = [
  'people',
  'person',
  'youth',
  'member',
  'members',
  'village',
  'ward',
  'phone',
  'email',
  'age',
  'married',
  'marriage',
  'spouse',
  'father',
  'mother',
  'gender',
  'male',
  'female',
  'alive',
  'active',
  'interests',
  'career',
  'education',
  'studying',
  'how many',
  'list',
  'show',
  'find',
  'search for',
  'who are',
  'who is',
  'which people',
  'which youth',
  'database',
  'records',
  'entries',
]

const WEB_KEYWORDS = [
  'what is',
  'what are',
  'who is',
  'who was',
  'who are',
  'how to',
  'how do',
  'how does',
  'how can',
  'why is',
  'why do',
  'why does',
  'when was',
  'when did',
  'when is',
  'where is',
  'where was',
  'where do',
  'population',
  'capital',
  'country',
  'world',
  'history',
  'science',
  'technology',
  'news',
  'weather',
  'stock',
  'price',
  'rate',
  'definition',
  'meaning',
  'explain',
  'describe',
  'current',
  'latest',
  'recent',
  'today',
  'recipe',
  'symptom',
  'treatment',
  'translate',
  'language',
]

export function classifyQuery(query: string): QueryClassification {
  const lower = query.toLowerCase().trim()

  const mentionsDB = DB_KEYWORDS.some(kw => lower.includes(kw))
  const mentionsWeb = WEB_KEYWORDS.some(kw => lower.includes(kw))

  if (mentionsDB && mentionsWeb)
    return 'both'
  if (mentionsWeb)
    return 'web'
  return 'database'
}

export async function naturalLanguageQuery(query: string): Promise<AiQueryResponse> {
  const client = await getAiClient()

  // Step 1: Generate SQL from natural language
  const sql = await client.chatCompletion(
    `Convert this question to a SQL query:\n\n"${query}"`,
    SCHEMA_CONTEXT,
  )

  // Validate the SQL is a SELECT query
  const cleanedSql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
  if (!cleanedSql.toUpperCase().startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed')
  }

  // Block dangerous keywords
  const blocked = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC']
  const upperSql = cleanedSql.toUpperCase()
  for (const keyword of blocked) {
    if (upperSql.includes(keyword)) {
      throw new Error(`Blocked keyword detected: ${keyword}`)
    }
  }

  // Step 2: Execute the SQL query
  const { useDatabase } = await import('../database')
  const database = useDatabase()

  let data: Record<string, unknown>[] = []
  try {
    if (database.driver === 'sqlite') {
      // better-sqlite3: synchronous .prepare().all()
      data = database.rawClient.prepare(cleanedSql).all() as Record<string, unknown>[]
    }
    else {
      // postgres.js: async .unsafe()
      data = await database.rawClient.unsafe(cleanedSql) as Record<string, unknown>[]
    }
  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`SQL execution failed: ${message}`)
  }

  // Step 3: Format results into natural language
  const answer = await client.chatCompletion(
    `Original question: "${query}"\n\nSQL query: ${cleanedSql}\n\nResults (${data.length} rows):\n${JSON.stringify(data.slice(0, 50), null, 2)}`,
    FORMAT_CONTEXT,
  )

  return {
    answer,
    sql: cleanedSql,
    rowCount: data.length,
    data: data.slice(0, 100),
  }
}

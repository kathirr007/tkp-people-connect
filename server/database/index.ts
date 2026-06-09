import { createRequire } from 'node:module'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sqliteUsers, sqlitePeople, pgUsers, pgPeople } from './schema'

const _require = createRequire(import.meta.url)

export type DbClient = ReturnType<typeof createDatabase>

let _db: DbClient | null = null

function createDatabase() {
  const driver = process.env.DB_DRIVER || 'sqlite'

  if (driver === 'postgres') {
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tkp-people-connect'
    const client = postgres(connectionString)
    const db = drizzlePg(client)
    return {
      db,
      driver: 'postgres' as const,
      users: pgUsers,
      people: pgPeople,
    }
  }

  // Default: SQLite (local dev only — not supported on Vercel)
  const Database = _require('better-sqlite3')
  const { drizzle: drizzleSqlite } = _require('drizzle-orm/better-sqlite3')
  const dbPath = process.env.SQLITE_DB_PATH || './data/database.sqlite'
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('busy_timeout = 5000')
  sqlite.pragma('synchronous = NORMAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzleSqlite(sqlite)
  return {
    db,
    driver: 'sqlite' as const,
    users: sqliteUsers,
    people: sqlitePeople,
  }
}

export function useDatabase() {
  if (!_db) {
    _db = createDatabase()
  }
  return _db
}

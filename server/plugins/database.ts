import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import process from 'node:process'
import { useDatabase } from '../database'
import { runPostgresMigrations, runSqliteMigrations } from '../database/migrate'

export default defineNitroPlugin(async () => {
  const driver = process.env.DB_DRIVER || 'sqlite'

  if (driver === 'sqlite') {
    const dbPath = process.env.SQLITE_DB_PATH || './data/database.sqlite'
    const dir = dirname(dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    runSqliteMigrations()
    console.warn(`[Database] SQLite initialized at ${dbPath}`)
  }
  else {
    await runPostgresMigrations()
    console.warn('[Database] PostgreSQL initialized')
  }

  useDatabase()
})

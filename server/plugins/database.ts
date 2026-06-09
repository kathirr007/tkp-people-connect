import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import { useDatabase } from '../database'
import { runSqliteMigrations } from '../database/migrate'

export default defineNitroPlugin(() => {
  const driver = process.env.DB_DRIVER || 'sqlite'

  if (driver === 'sqlite') {
    const dbPath = process.env.SQLITE_DB_PATH || './data/database.sqlite'
    const dir = dirname(dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    runSqliteMigrations()
    console.log(`[Database] SQLite initialized at ${dbPath}`)
  }
  else {
    console.log('[Database] PostgreSQL mode - ensure DATABASE_URL is configured')
  }

  // Initialize the database connection
  useDatabase()
})

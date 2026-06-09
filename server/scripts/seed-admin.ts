import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import bcrypt from 'bcrypt'
import Database from 'better-sqlite3'

const DB_DRIVER = process.env.DB_DRIVER || 'sqlite'
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './data/database.sqlite'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tkp-people-connect.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123'
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin'
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'User'

async function seedAdmin() {
  if (DB_DRIVER === 'postgres') {
    const { default: postgres } = await import('postgres')
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tkp-people-connect'
    const sql = postgres(connectionString)

    try {
      // Create table if not exists
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(10) NOT NULL DEFAULT 'viewer',
          is_verified BOOLEAN NOT NULL DEFAULT false,
          verification_token VARCHAR(255),
          reset_password_token VARCHAR(255),
          reset_password_expires TIMESTAMP,
          refresh_token TEXT,
          last_login TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `

      const existing = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`
      if (existing.length > 0) {
        console.log(`[Seed] Admin user already exists: ${ADMIN_EMAIL}`)
        await sql.end()
        return
      }

      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
      const id = crypto.randomUUID()

      await sql`
        INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
        VALUES (${id}, ${ADMIN_EMAIL}, ${hashedPassword}, ${ADMIN_FIRST_NAME}, ${ADMIN_LAST_NAME}, 'admin', true, NOW(), NOW())
      `

      console.log(`[Seed] Admin user created: ${ADMIN_EMAIL}`)
      await sql.end()
    }
    catch (error) {
      console.error('[Seed] Error:', error)
      await sql.end()
      process.exit(1)
    }
  }
  else {
    // SQLite
    const dir = dirname(SQLITE_DB_PATH)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    const db = new Database(SQLITE_DB_PATH)
    db.pragma('journal_mode = WAL')

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        is_verified INTEGER NOT NULL DEFAULT 0,
        verification_token TEXT,
        reset_password_token TEXT,
        reset_password_expires TEXT,
        refresh_token TEXT,
        last_login TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL)
    if (existing) {
      console.log(`[Seed] Admin user already exists: ${ADMIN_EMAIL}`)
      db.close()
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'admin', 1, ?, ?)
    `).run(id, ADMIN_EMAIL, hashedPassword, ADMIN_FIRST_NAME, ADMIN_LAST_NAME, now, now)

    console.log(`[Seed] Admin user created: ${ADMIN_EMAIL}`)
    db.close()
  }
}

seedAdmin()

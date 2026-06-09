import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import bcrypt from 'bcrypt'
import Database from 'better-sqlite3'

const DB_DRIVER = process.env.DB_DRIVER || 'sqlite'
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './data/database.sqlite'

const seedUsers = [
  { email: 'admin1@tkp-people-connect.com', password: 'Admin@123', firstName: 'Admin', lastName: 'One', role: 'admin' },
  { email: 'admin2@tkp-people-connect.com', password: 'Admin@123', firstName: 'Admin', lastName: 'Two', role: 'admin' },
  { email: 'user1@tkp-people-connect.com', password: 'User@123', firstName: 'User', lastName: 'One', role: 'user' },
  { email: 'user2@tkp-people-connect.com', password: 'User@123', firstName: 'User', lastName: 'Two', role: 'user' },
  { email: 'viewer1@tkp-people-connect.com', password: 'Viewer@123', firstName: 'Viewer', lastName: 'One', role: 'viewer' },
  { email: 'viewer2@tkp-people-connect.com', password: 'Viewer@123', firstName: 'Viewer', lastName: 'Two', role: 'viewer' },
]

async function seed() {
  if (DB_DRIVER === 'postgres') {
    const { default: postgres } = await import('postgres')
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tkp-people-connect'
    const sql = postgres(connectionString)

    try {
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

      for (const u of seedUsers) {
        const existing = await sql`SELECT id FROM users WHERE email = ${u.email}`
        if (existing.length > 0) {
          console.log(`[Seed] Already exists: ${u.email}`)
          continue
        }

        const hashedPassword = await bcrypt.hash(u.password, 12)
        const id = crypto.randomUUID()

        await sql`
          INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
          VALUES (${id}, ${u.email}, ${hashedPassword}, ${u.firstName}, ${u.lastName}, ${u.role}, true, NOW(), NOW())
        `
        console.log(`[Seed] Created ${u.role}: ${u.email}`)
      }

      await sql.end()
    }
    catch (error) {
      console.error('[Seed] Error:', error)
      await sql.end()
      process.exit(1)
    }
  }
  else {
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

    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?')
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `)

    for (const u of seedUsers) {
      const existing = checkStmt.get(u.email)
      if (existing) {
        console.log(`[Seed] Already exists: ${u.email}`)
        continue
      }

      const hashedPassword = await bcrypt.hash(u.password, 12)
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      insertStmt.run(id, u.email, hashedPassword, u.firstName, u.lastName, u.role, now, now)
      console.log(`[Seed] Created ${u.role}: ${u.email}`)
    }

    db.close()
  }
}

seed()

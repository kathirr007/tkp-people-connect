import { createRequire } from 'node:module'
import postgres from 'postgres'

const _require = createRequire(import.meta.url)

const DB_PATH = process.env.SQLITE_DB_PATH || './data/database.sqlite'

function getTableColumns(db: any, tableName: string) {
  return db.prepare(`PRAGMA table_info('${tableName}')`).all().map((row: any) => row.name as string)
}

function normalizeUsernameCandidate(value: string) {
  const candidate = value
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 50)
    .replace(/^_+|_+$/g, '')

  return candidate || `user_${Math.random().toString(36).slice(2, 10)}`
}

export function runSqliteMigrations() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = _require('better-sqlite3')
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
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
    );

    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      street TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      country TEXT,
      organization TEXT,
      designation TEXT,
      department TEXT,
      notes TEXT,
      tags TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      updated_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  const userColumns = getTableColumns(db, 'users')
  if (!userColumns.includes('username')) {
    db.exec('ALTER TABLE users ADD COLUMN username TEXT')

    const existingUsers = db.prepare('SELECT id, email FROM users').all() as Array<{ id: string; email: string | null }>
    const usedUsernames = new Set<string>()
    const updateStmt = db.prepare('UPDATE users SET username = ? WHERE id = ?')

    for (const user of existingUsers) {
      const localPart = user.email && user.email.includes('@')
        ? user.email.slice(0, user.email.indexOf('@'))
        : user.id
      let username = normalizeUsernameCandidate(localPart)
      const baseUsername = username
      let suffix = 1

      while (usedUsernames.has(username)) {
        username = `${baseUsername}_${suffix++}`.slice(0, 50)
      }

      usedUsernames.add(username)
      updateStmt.run(username, user.id)
    }
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_people_first_name ON people(first_name);
    CREATE INDEX IF NOT EXISTS idx_people_last_name ON people(last_name);
    CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
    CREATE INDEX IF NOT EXISTS idx_people_organization ON people(organization);
  `)

  db.close()
}

export async function runPostgresMigrations() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tkp-people-connect'
  const sql = postgres(connectionString)

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
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

  await sql`
    CREATE TABLE IF NOT EXISTS people (
      id VARCHAR(36) PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      street VARCHAR(200),
      city VARCHAR(100),
      state VARCHAR(100),
      zip_code VARCHAR(20),
      country VARCHAR(100),
      organization VARCHAR(200),
      designation VARCHAR(200),
      department VARCHAR(200),
      notes TEXT,
      tags TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_by VARCHAR(36) NOT NULL,
      updated_by VARCHAR(36),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_people_first_name ON people(first_name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_people_last_name ON people(last_name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_people_email ON people(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_people_organization ON people(organization)`

  await sql.end()
}

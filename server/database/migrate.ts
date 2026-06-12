import { createRequire } from 'node:module'
import process from 'node:process'
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
      gender TEXT,
      date_of_birth TEXT,
      age INTEGER, -- Added age column
      phone TEXT,
      email TEXT,
      village TEXT,
      ward TEXT,
      address TEXT,
      father_name TEXT,
      father_phone TEXT,
      father_id TEXT,
      mother_name TEXT,
      mother_phone TEXT,
      mother_id TEXT,
      marital_status TEXT,
      spouse_name TEXT,
      spouse_phone TEXT,
      spouse_id TEXT,
      marriage_year INTEGER,
      number_of_children INTEGER,
      notes TEXT,
      is_alive INTEGER NOT NULL DEFAULT 1,
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

    const existingUsers = db.prepare('SELECT id, email FROM users').all() as Array<{ id: string, email: string | null }>
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

  // Add children and education columns if they don't exist
  const peopleColumns = getTableColumns(db, 'people')
  if (!peopleColumns.includes('children')) {
    db.exec('ALTER TABLE people ADD COLUMN children TEXT DEFAULT \'[]\'')
  }
  if (!peopleColumns.includes('education')) {
    db.exec('ALTER TABLE people ADD COLUMN education TEXT DEFAULT \'[]\'')
  }

  // Add age column to people table if it doesn't exist
  if (!peopleColumns.includes('age')) {
    db.exec('ALTER TABLE people ADD COLUMN age INTEGER')
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS youth (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT,
      date_of_birth TEXT,
      age INTEGER, -- Added age column
      phone TEXT,
      email TEXT,
      village TEXT,
      ward TEXT,
      address TEXT,
      father_name TEXT,
      father_phone TEXT,
      mother_name TEXT,
      mother_phone TEXT,
      currently_studying INTEGER NOT NULL DEFAULT 1,
      education_details TEXT DEFAULT '[]',
      activities TEXT DEFAULT '[]',
      achievements TEXT DEFAULT '[]',
      interests TEXT,
      career_goal TEXT,
      blood_group TEXT,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      updated_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  // Add age column to youth table if it doesn't exist
  const youthColumns = getTableColumns(db, 'youth')
  if (!youthColumns.includes('age')) {
    db.exec('ALTER TABLE youth ADD COLUMN age INTEGER')
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_people_first_name ON people(first_name);
    CREATE INDEX IF NOT EXISTS idx_people_last_name ON people(last_name);
    CREATE INDEX IF NOT EXISTS idx_people_village ON people(village);
    CREATE INDEX IF NOT EXISTS idx_youth_first_name ON youth(first_name);
    CREATE INDEX IF NOT EXISTS idx_youth_last_name ON youth(last_name);
    CREATE INDEX IF NOT EXISTS idx_youth_village ON youth(village);
  `)

  db.close()
}

export async function runPostgresMigrations() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tkp-people-connect'
  const sql = postgres(connectionString, {
    onnotice: () => {},
  })

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE,
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
      gender VARCHAR(10),
      date_of_birth VARCHAR(20),
      age INTEGER, -- Added age column
      phone VARCHAR(20),
      email VARCHAR(255),
      village VARCHAR(100),
      ward VARCHAR(100),
      address TEXT,
      father_name VARCHAR(100),
      father_phone VARCHAR(20),
      father_id VARCHAR(36),
      mother_name VARCHAR(100),
      mother_phone VARCHAR(20),
      mother_id VARCHAR(36),
      marital_status VARCHAR(20),
      spouse_name VARCHAR(100),
      spouse_phone VARCHAR(20),
      spouse_id VARCHAR(36),
      marriage_year INTEGER,
      number_of_children INTEGER,
      notes TEXT,
      is_alive BOOLEAN NOT NULL DEFAULT true,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_by VARCHAR(36) NOT NULL,
      updated_by VARCHAR(36),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Check if username column exists; add it if missing
  const userColumns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  `

  if (userColumns.length === 0) {
    await sql`ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE`

    const existingUsers = await sql`SELECT id, email FROM users WHERE username IS NULL`
    const usedUsernames = new Set<string>()

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
      await sql`UPDATE users SET username = ${username} WHERE id = ${user.id}`
    }
  }

  await sql`
    CREATE TABLE IF NOT EXISTS youth (
      id VARCHAR(36) PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      gender VARCHAR(10),
      date_of_birth VARCHAR(20),
      age INTEGER, -- Added age column
      phone VARCHAR(20),
      email VARCHAR(255),
      village VARCHAR(100),
      ward VARCHAR(100),
      address TEXT,
      father_name VARCHAR(100),
      father_phone VARCHAR(20),
      mother_name VARCHAR(100),
      mother_phone VARCHAR(20),
      currently_studying BOOLEAN NOT NULL DEFAULT true,
      education_details TEXT,
      activities TEXT,
      achievements TEXT,
      interests TEXT,
      career_goal VARCHAR(255),
      blood_group VARCHAR(10),
      notes TEXT,
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
  await sql`CREATE INDEX IF NOT EXISTS idx_people_village ON people(village)`
  await sql`CREATE INDEX IF NOT EXISTS idx_youth_first_name ON youth(first_name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_youth_last_name ON youth(last_name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_youth_village ON youth(village)`

  // Add children and education columns if they don't exist
  const peopleColumns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'people' AND column_name IN ('children', 'education')
  `
  const columnNames = peopleColumns.map((c: any) => c.column_name)

  if (!columnNames.includes('children')) {
    await sql`ALTER TABLE people ADD COLUMN children TEXT`
  }

  if (!columnNames.includes('education')) {
    await sql`ALTER TABLE people ADD COLUMN education TEXT`
  }

  // Add age column to people table if it doesn't exist
  const peopleAgeColumn = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'people' AND column_name = 'age'
  `
  if (peopleAgeColumn.length === 0) {
    await sql`ALTER TABLE people ADD COLUMN age INTEGER`
  }

  // Add age column to youth table if it doesn't exist
  const youthAgeColumn = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'youth' AND column_name = 'age'
  `
  if (youthAgeColumn.length === 0) {
    await sql`ALTER TABLE youth ADD COLUMN age INTEGER`
  }

  await sql.end()
}

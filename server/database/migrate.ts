import Database from 'better-sqlite3'

const DB_PATH = process.env.SQLITE_DB_PATH || './data/database.sqlite'

export function runSqliteMigrations() {
  const db = new Database(DB_PATH)
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

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_people_first_name ON people(first_name);
    CREATE INDEX IF NOT EXISTS idx_people_last_name ON people(last_name);
    CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
    CREATE INDEX IF NOT EXISTS idx_people_organization ON people(organization);
  `)

  db.close()
}

import { mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'

function loadEnv(filePath: string) {
  if (!existsSync(filePath)) {
    return
  }

  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnv(resolve(process.cwd(), '.env'))

const DB_DRIVER = process.env.DB_DRIVER || 'sqlite'
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './data/database.sqlite'

console.log(`[Seed] DB_DRIVER=${DB_DRIVER}`)
console.log(`[Seed] DATABASE_URL=${process.env.DATABASE_URL ? '[loaded]' : '[not set]'}`)

const seedPeople = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    organization: 'TechCorp India',
    designation: 'Senior Developer',
    department: 'Engineering',
    street: '42 MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560001',
    country: 'India',
    notes: 'Full-stack developer with 8 years of experience',
    tags: JSON.stringify(['developer', 'fullstack', 'team-lead']),
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 87654 32109',
    organization: 'DesignHub',
    designation: 'UX Designer',
    department: 'Design',
    street: '15 Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110001',
    country: 'India',
    notes: 'Specializes in mobile-first design and accessibility',
    tags: JSON.stringify(['designer', 'ux', 'accessibility']),
  },
  {
    firstName: 'Arun',
    lastName: 'Patel',
    email: 'arun.patel@example.com',
    phone: '+91 76543 21098',
    organization: 'DataWorks',
    designation: 'Project Manager',
    department: 'Operations',
    street: '88 SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '380015',
    country: 'India',
    notes: 'PMP certified with expertise in agile methodologies',
    tags: JSON.stringify(['manager', 'agile', 'pmp']),
  },
]

const seedUsers = [
  { username: 'admin1', email: 'admin1@tkp-people-connect.com', password: 'Admin@123', firstName: 'Admin', lastName: 'One', role: 'admin' },
  { username: 'admin2', email: 'admin2@tkp-people-connect.com', password: 'Admin@123', firstName: 'Admin', lastName: 'Two', role: 'admin' },
  { username: 'user1', email: 'user1@tkp-people-connect.com', password: 'User@123', firstName: 'User', lastName: 'One', role: 'user' },
  { username: 'user2', email: 'user2@tkp-people-connect.com', password: 'User@123', firstName: 'User', lastName: 'Two', role: 'user' },
  { username: 'viewer1', email: 'viewer1@tkp-people-connect.com', password: 'Viewer@123', firstName: 'Viewer', lastName: 'One', role: 'viewer' },
  { username: 'viewer2', email: 'viewer2@tkp-people-connect.com', password: 'Viewer@123', firstName: 'Viewer', lastName: 'Two', role: 'viewer' },
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

      for (const u of seedUsers) {
        const existing = await sql`SELECT id FROM users WHERE email = ${u.email}`
        if (existing.length > 0) {
          console.log(`[Seed] Already exists: ${u.email}`)
          continue
        }

        const hashedPassword = await bcrypt.hash(u.password, 12)
        const id = crypto.randomUUID()

        await sql`
          INSERT INTO users (id, username, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
          VALUES (${id}, ${u.username}, ${u.email}, ${hashedPassword}, ${u.firstName}, ${u.lastName}, ${u.role}, true, NOW(), NOW())
        `
        console.log(`[Seed] Created ${u.role}: ${u.email}`)
      }

      const adminUser = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`
      const createdBy = adminUser[0]?.id || 'system'

      for (const p of seedPeople) {
        const existing = await sql`SELECT id FROM people WHERE email = ${p.email}`
        if (existing.length > 0) {
          console.log(`[Seed] Person already exists: ${p.email}`)
          continue
        }

        const id = crypto.randomUUID()
        await sql`
          INSERT INTO people (id, first_name, last_name, email, phone, organization, designation, department, street, city, state, zip_code, country, notes, tags, is_active, created_by, created_at, updated_at)
          VALUES (${id}, ${p.firstName}, ${p.lastName}, ${p.email}, ${p.phone}, ${p.organization}, ${p.designation}, ${p.department}, ${p.street}, ${p.city}, ${p.state}, ${p.zipCode}, ${p.country}, ${p.notes}, ${p.tags}, true, ${createdBy}, NOW(), NOW())
        `
        console.log(`[Seed] Created person: ${p.firstName} ${p.lastName}`)
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
      )
    `)

    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?')
    const insertStmt = db.prepare(`
      INSERT INTO users (id, username, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
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

      insertStmt.run(id, u.username, u.email, hashedPassword, u.firstName, u.lastName, u.role, now, now)
      console.log(`[Seed] Created ${u.role}: ${u.email}`)
    }

    const adminRow = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as { id: string } | undefined
    const createdBy = adminRow?.id || 'system'

    db.exec(`
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
      )
    `)

    const checkPersonStmt = db.prepare('SELECT id FROM people WHERE email = ?')
    const insertPersonStmt = db.prepare(`
      INSERT INTO people (id, first_name, last_name, email, phone, organization, designation, department, street, city, state, zip_code, country, notes, tags, is_active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `)

    for (const p of seedPeople) {
      const existing = checkPersonStmt.get(p.email)
      if (existing) {
        console.log(`[Seed] Person already exists: ${p.email}`)
        continue
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      insertPersonStmt.run(id, p.firstName, p.lastName, p.email, p.phone, p.organization, p.designation, p.department, p.street, p.city, p.state, p.zipCode, p.country, p.notes, p.tags, createdBy, now, now)
      console.log(`[Seed] Created person: ${p.firstName} ${p.lastName}`)
    }

    db.close()
  }
}

seed()

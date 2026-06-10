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
    firstName: 'Murugan',
    lastName: 'Selvam',
    gender: 'male',
    dateOfBirth: '1975-06-15',
    phone: '+91 98765 43210',
    village: 'Thuraiyur',
    ward: 'Ward 3',
    address: '12 Main Street, Thuraiyur, Tamil Nadu',
    fatherName: 'Selvam Gounder',
    fatherPhone: '+91 97654 32109',
    motherName: 'Meenakshi Selvam',
    maritalStatus: 'married',
    spouseName: 'Lakshmi Murugan',
    spousePhone: '+91 87654 32109',
    marriageYear: 2002,
    numberOfChildren: 3,
    notes: 'Farmer. Active member of village panchayat.',
  },
  {
    firstName: 'Ravi',
    lastName: 'Krishnan',
    gender: 'male',
    dateOfBirth: '1990-03-22',
    phone: '+91 76543 21098',
    village: 'Thuraiyur',
    ward: 'Ward 1',
    address: '45 North Street, Thuraiyur, Tamil Nadu',
    fatherName: 'Krishnan Pillai',
    motherName: 'Saraswathi Krishnan',
    maritalStatus: 'single',
    notes: 'School teacher at government high school.',
  },
  {
    firstName: 'Kavitha',
    lastName: 'Raj',
    gender: 'female',
    dateOfBirth: '1985-11-08',
    phone: '+91 65432 10987',
    village: 'Senthurai',
    ward: 'Ward 2',
    address: '7 Temple Road, Senthurai, Tamil Nadu',
    fatherName: 'Raj Mudaliar',
    motherName: 'Vijaya Raj',
    maritalStatus: 'widowed',
    numberOfChildren: 2,
    notes: 'Runs a small grocery shop.',
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
    const sql = postgres(connectionString, {
      onnotice: () => {},
    })

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

      await sql`
        CREATE TABLE IF NOT EXISTS people (
          id VARCHAR(36) PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          gender VARCHAR(10),
          date_of_birth VARCHAR(20),
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
          children TEXT,
          education TEXT,
          notes TEXT,
          is_alive BOOLEAN NOT NULL DEFAULT true,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_by VARCHAR(36) NOT NULL,
          updated_by VARCHAR(36),
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
        const existing = await sql`SELECT id FROM people WHERE first_name = ${p.firstName} AND last_name = ${p.lastName} AND village = ${p.village}`
        if (existing.length > 0) {
          console.log(`[Seed] Person already exists: ${p.firstName} ${p.lastName}`)
          continue
        }

        const id = crypto.randomUUID()
        await sql`
          INSERT INTO people (id, first_name, last_name, gender, date_of_birth, phone, village, ward, address,
            father_name, father_phone, mother_name, marital_status, spouse_name, spouse_phone,
            marriage_year, number_of_children, children, education, notes, is_alive, is_active, created_by, created_at, updated_at)
          VALUES (
            ${id}, ${p.firstName}, ${p.lastName}, ${p.gender ?? null}, ${p.dateOfBirth ?? null}, ${p.phone ?? null},
            ${p.village ?? null}, ${p.ward ?? null}, ${p.address ?? null},
            ${p.fatherName ?? null}, ${p.fatherPhone ?? null}, ${p.motherName ?? null},
            ${p.maritalStatus ?? null}, ${p.spouseName ?? null}, ${p.spousePhone ?? null},
            ${p.marriageYear ?? null}, ${p.numberOfChildren ?? null}, '[]', '[]', ${p.notes ?? null},
            true, true, ${createdBy}, NOW(), NOW()
          )
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
        gender TEXT,
        date_of_birth TEXT,
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
      )
    `)

    const checkPersonStmt = db.prepare('SELECT id FROM people WHERE first_name = ? AND last_name = ? AND village = ?')
    const insertPersonStmt = db.prepare(`
      INSERT INTO people (id, first_name, last_name, gender, date_of_birth, phone, village, ward, address,
        father_name, father_phone, mother_name, marital_status, spouse_name, spouse_phone,
        marriage_year, number_of_children, notes, is_alive, is_active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)
    `)

    for (const p of seedPeople) {
      const existing = checkPersonStmt.get(p.firstName, p.lastName, p.village ?? '')
      if (existing) {
        console.log(`[Seed] Person already exists: ${p.firstName} ${p.lastName}`)
        continue
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      insertPersonStmt.run(
        id, p.firstName, p.lastName, p.gender ?? null, p.dateOfBirth ?? null, p.phone ?? null,
        p.village ?? null, p.ward ?? null, p.address ?? null,
        p.fatherName ?? null, p.fatherPhone ?? null, p.motherName ?? null,
        p.maritalStatus ?? null, p.spouseName ?? null, p.spousePhone ?? null,
        p.marriageYear ?? null, p.numberOfChildren ?? null, p.notes ?? null,
        createdBy, now, now,
      )
      console.log(`[Seed] Created person: ${p.firstName} ${p.lastName}`)
    }

    db.close()
  }
}

seed()

import { eq, like, or, and, desc, asc, sql, count } from 'drizzle-orm'
import { useDatabase } from '../database'

export interface UserRecord {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  isVerified: boolean
  verificationToken: string | null
  resetPasswordToken: string | null
  resetPasswordExpires: string | Date | null
  refreshToken: string | null
  lastLogin: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface PersonRecord {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  organization: string | null
  designation: string | null
  department: string | null
  notes: string | null
  tags: string | null
  isActive: boolean
  createdBy: string
  updatedBy: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

// ---- User queries ----

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const { db, users } = useDatabase()
  const normalizedEmail = email.trim().toLowerCase()
  const results = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1)
  return results[0] as UserRecord | undefined
}

export async function findUserByUsername(username: string): Promise<UserRecord | undefined> {
  const { db, users } = useDatabase()
  const normalizedUsername = username.trim().toLowerCase()
  const results = await db.select().from(users).where(eq(users.username, normalizedUsername)).limit(1)
  return results[0] as UserRecord | undefined
}

export async function findUserByIdentifier(identifier: string): Promise<UserRecord | undefined> {
  const normalizedIdentifier = identifier.trim()
  const isEmail = normalizedIdentifier.includes('@')
  if (isEmail) {
    return findUserByEmail(normalizedIdentifier)
  }
  return findUserByUsername(normalizedIdentifier)
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const { db, users } = useDatabase()
  const results = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return results[0] as UserRecord | undefined
}

export async function findUserByVerificationToken(token: string): Promise<UserRecord | undefined> {
  const { db, users } = useDatabase()
  const results = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1)
  return results[0] as UserRecord | undefined
}

export async function findUserByResetToken(token: string): Promise<UserRecord | undefined> {
  const { db, users } = useDatabase()
  const results = await db.select().from(users)
    .where(and(
      eq(users.resetPasswordToken, token),
      sql`${users.resetPasswordExpires} > ${new Date().toISOString()}`,
    ))
    .limit(1)
  return results[0] as UserRecord | undefined
}

export async function createUser(data: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  isVerified?: boolean
  verificationToken?: string | null
}): Promise<UserRecord> {
  const { db, users } = useDatabase()
  const now = new Date().toISOString()
  const results = await db.insert(users).values({
    username: data.username.toLowerCase(),
    email: data.email.toLowerCase(),
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'viewer',
    isVerified: data.isVerified || false,
    verificationToken: data.verificationToken || null,
    createdAt: now,
    updatedAt: now,
  } as any).returning()
  return results[0] as UserRecord
}

export async function updateUser(id: string, data: Partial<Record<string, unknown>>): Promise<void> {
  const { db, users } = useDatabase()
  const updateData = { ...data, updatedAt: new Date().toISOString() } as any
  await db.update(users).set(updateData).where(eq(users.id, id))
}

export async function listUsers(params: { page: number, limit: number, search?: string }) {
  const { db, users } = useDatabase()
  const { page, limit, search } = params
  const offset = (page - 1) * limit

  let whereClause
  if (search) {
    whereClause = or(
      like(users.username, `%${search}%`),
      like(users.firstName, `%${search}%`),
      like(users.lastName, `%${search}%`),
      like(users.email, `%${search}%`),
    )
  }

  const [data, totalResult] = await Promise.all([
    db.select().from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(users).where(whereClause),
  ])

  const total = totalResult[0]?.count || 0

  // Strip passwords from results
  const safeData = (data as UserRecord[]).map(({ password, refreshToken, resetPasswordToken, resetPasswordExpires, ...rest }) => rest)

  return {
    data: safeData,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ---- People queries ----

export async function findPersonById(id: string): Promise<PersonRecord | undefined> {
  const { db, people } = useDatabase()
  const results = await db.select().from(people).where(eq(people.id, id)).limit(1)
  return results[0] as PersonRecord | undefined
}

export async function createPerson(data: Record<string, unknown>): Promise<PersonRecord> {
  const { db, people } = useDatabase()
  const now = new Date().toISOString()
  const results = await db.insert(people).values({
    ...data,
    tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : (data.tags || null),
    createdAt: now,
    updatedAt: now,
  } as any).returning()
  return results[0] as PersonRecord
}

export async function updatePerson(id: string, data: Record<string, unknown>): Promise<PersonRecord | undefined> {
  const { db, people } = useDatabase()
  const updateData = {
    ...data,
    tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags,
    updatedAt: new Date().toISOString(),
  } as any
  const results = await db.update(people).set(updateData).where(eq(people.id, id)).returning()
  return results[0] as PersonRecord | undefined
}

export async function deletePerson(id: string): Promise<boolean> {
  const { db, people } = useDatabase()
  const results = await db.delete(people).where(eq(people.id, id)).returning()
  return results.length > 0
}

export async function listPeople(params: {
  page: number
  limit: number
  search?: string
  organization?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { db, people } = useDatabase()
  const { page, limit, search, organization, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params
  const offset = (page - 1) * limit

  const conditions = []
  if (search) {
    conditions.push(or(
      like(people.firstName, `%${search}%`),
      like(people.lastName, `%${search}%`),
      like(people.email, `%${search}%`),
      like(people.organization, `%${search}%`),
    ))
  }
  if (organization) {
    conditions.push(like(people.organization, `%${organization}%`))
  }
  if (isActive !== undefined) {
    conditions.push(eq(people.isActive, isActive))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const sortColumn = (people as any)[sortBy] || people.createdAt
  const orderFn = sortOrder === 'asc' ? asc : desc

  const [data, totalResult] = await Promise.all([
    db.select().from(people)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(people).where(whereClause),
  ])

  const total = totalResult[0]?.count || 0

  return {
    data: (data as PersonRecord[]).map(formatPerson),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function insertManyPeople(records: Record<string, unknown>[]): Promise<number> {
  const { db, people } = useDatabase()
  const now = new Date().toISOString()
  const values = records.map(r => ({
    ...r,
    tags: Array.isArray(r.tags) ? JSON.stringify(r.tags) : (r.tags || null),
    createdAt: now,
    updatedAt: now,
  })) as any[]

  const result = await db.insert(people).values(values).returning()
  return result.length
}

export async function getAllPeopleForExport(filter?: { search?: string, organization?: string }) {
  const { db, people } = useDatabase()

  const conditions = []
  if (filter?.search) {
    conditions.push(or(
      like(people.firstName, `%${filter.search}%`),
      like(people.lastName, `%${filter.search}%`),
      like(people.email, `%${filter.search}%`),
      like(people.organization, `%${filter.search}%`),
    ))
  }
  if (filter?.organization) {
    conditions.push(like(people.organization, `%${filter.organization}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const data = await db.select().from(people).where(whereClause)
  return (data as PersonRecord[]).map(formatPerson)
}

export async function getDashboardStats() {
  const { db, people } = useDatabase()

  const [totalResult, activeResult, allPeople] = await Promise.all([
    db.select({ count: count() }).from(people),
    db.select({ count: count() }).from(people).where(eq(people.isActive, true)),
    db.select().from(people).orderBy(desc(people.createdAt)),
  ])

  const total = totalResult[0]?.count || 0
  const active = activeResult[0]?.count || 0
  const allRecords = allPeople as PersonRecord[]

  // Get top organizations
  const orgCounts: Record<string, number> = {}
  for (const p of allRecords) {
    if (p.organization) {
      orgCounts[p.organization] = (orgCounts[p.organization] || 0) + 1
    }
  }
  const byOrganization = Object.entries(orgCounts)
    .map(([name, cnt]) => ({ name, count: cnt }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const recentlyAdded = allRecords.slice(0, 5).map(formatPerson)

  return {
    totalPeople: total,
    activePeople: active,
    inactivePeople: total - active,
    totalOrganizations: Object.keys(orgCounts).length,
    recentlyAdded,
    byOrganization,
  }
}

// ---- Helpers ----

function formatPerson(record: PersonRecord) {
  return {
    _id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email || '',
    phone: record.phone || '',
    address: {
      street: record.street || '',
      city: record.city || '',
      state: record.state || '',
      zipCode: record.zipCode || '',
      country: record.country || '',
    },
    organization: record.organization || '',
    designation: record.designation || '',
    department: record.department || '',
    notes: record.notes || '',
    tags: record.tags ? JSON.parse(record.tags) : [],
    isActive: record.isActive,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

import { randomUUID } from 'node:crypto'
import { and, asc, count, desc, eq, like, or, sql } from 'drizzle-orm'
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
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  village: string | null
  ward: string | null
  address: string | null
  fatherName: string | null
  fatherPhone: string | null
  fatherId: string | null
  motherName: string | null
  motherPhone: string | null
  motherId: string | null
  maritalStatus: string | null
  spouseName: string | null
  spousePhone: string | null
  spouseId: string | null
  marriageYear: number | null
  numberOfChildren: number | null
  notes: string | null
  isAlive: boolean
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
  const results = await db.select().from(users).where(and(
    eq(users.resetPasswordToken, token),
    sql`${users.resetPasswordExpires} > ${new Date().toISOString()}`,
  )).limit(1)
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
  const id = randomUUID()

  const results = await db.insert(users).values({
    id,
    username: data.username.toLowerCase(),
    email: data.email.toLowerCase(),
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'viewer',
    isVerified: data.isVerified || false,
    verificationToken: data.verificationToken || null,
  } as any).returning()

  return results[0] as UserRecord
}

export async function updateUser(id: string, data: Partial<Record<string, unknown>>): Promise<void> {
  const { db, users, driver } = useDatabase()

  const updateData: any = { ...data }

  if (driver === 'postgres') {
    // For PostgreSQL, convert ISO strings/Date to Date objects for timestamp columns
    if (updateData.lastLogin) {
      updateData.lastLogin = updateData.lastLogin instanceof Date ? updateData.lastLogin : new Date(updateData.lastLogin as string)
    }
    if (updateData.resetPasswordExpires) {
      updateData.resetPasswordExpires = updateData.resetPasswordExpires instanceof Date ? updateData.resetPasswordExpires : new Date(updateData.resetPasswordExpires as string)
    }
    // For PostgreSQL, updatedAt has defaultNow() so we don't need to set it
  }
  else {
    // For SQLite, convert Date objects to ISO strings for text columns
    if (updateData.lastLogin instanceof Date) {
      updateData.lastLogin = updateData.lastLogin.toISOString()
    }
    if (updateData.resetPasswordExpires instanceof Date) {
      updateData.resetPasswordExpires = updateData.resetPasswordExpires.toISOString()
    }
    // For SQLite, manually set updatedAt
    updateData.updatedAt = new Date().toISOString()
  }

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
    db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
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
  const results = await db.insert(people).values({ ...data } as any).returning()
  return results[0] as PersonRecord
}

export async function updatePerson(id: string, data: Record<string, unknown>): Promise<PersonRecord | undefined> {
  const { db, people, driver } = useDatabase()

  const updateData: any = { ...data }

  if (driver === 'sqlite') {
    updateData.updatedAt = new Date().toISOString()
  }

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
  village?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { db, people } = useDatabase()
  const { page, limit, search, village, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params
  const offset = (page - 1) * limit

  const conditions = []
  if (search) {
    conditions.push(or(
      like(people.firstName, `%${search}%`),
      like(people.lastName, `%${search}%`),
      like(people.phone, `%${search}%`),
      like(people.village, `%${search}%`),
    ))
  }
  if (village) {
    conditions.push(like(people.village, `%${village}%`))
  }
  if (isActive !== undefined) {
    conditions.push(eq(people.isActive, isActive))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const sortColumn = (people as any)[sortBy] || people.createdAt
  const orderFn = sortOrder === 'asc' ? asc : desc

  const [data, totalResult] = await Promise.all([
    db.select().from(people).where(whereClause).orderBy(orderFn(sortColumn)).limit(limit).offset(offset),
    db.select({ count: count() }).from(people).where(whereClause),
  ])

  return {
    data: (data as PersonRecord[]).map(formatPerson),
    meta: { total: totalResult[0]?.count || 0, page, limit, totalPages: Math.ceil((totalResult[0]?.count || 0) / limit) },
  }
}

export async function insertManyPeople(records: Record<string, unknown>[]): Promise<number> {
  const { db, people } = useDatabase()
  const result = await db.insert(people).values(records as any[]).returning()
  return result.length
}

export async function getAllPeopleForExport(filter?: { search?: string, village?: string }) {
  const { db, people } = useDatabase()

  const conditions = []
  if (filter?.search) {
    conditions.push(or(
      like(people.firstName, `%${filter.search}%`),
      like(people.lastName, `%${filter.search}%`),
      like(people.village, `%${filter.search}%`),
    ))
  }
  if (filter?.village) {
    conditions.push(like(people.village, `%${filter.village}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const data = await db.select().from(people).where(whereClause)
  return (data as PersonRecord[]).map(formatPerson)
}

export async function getDashboardStats() {
  const { db, people } = useDatabase()

  const [totalResult, activeResult, recentPeople] = await Promise.all([
    db.select({ count: count() }).from(people),
    db.select({ count: count() }).from(people).where(eq(people.isActive, true)),
    db.select().from(people).orderBy(desc(people.createdAt)).limit(5),
  ])

  const total = totalResult[0]?.count || 0
  const active = activeResult[0]?.count || 0

  return {
    totalPeople: total,
    activePeople: active,
    inactivePeople: total - active,
    recentlyAdded: (recentPeople as PersonRecord[]).map(formatPerson),
  }
}

// ---- Youth queries ----

export interface YouthRecord {
  id: string
  firstName: string
  lastName: string
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  village: string | null
  ward: string | null
  address: string | null
  fatherName: string | null
  fatherPhone: string | null
  motherName: string | null
  motherPhone: string | null
  currentlyStudying: boolean
  educationDetails: string | null
  activities: string | null
  achievements: string | null
  interests: string | null
  careerGoal: string | null
  bloodGroup: string | null
  notes: string | null
  isActive: boolean
  createdBy: string
  updatedBy: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export async function findYouthById(id: string): Promise<YouthRecord | undefined> {
  const { db, youth } = useDatabase()
  const results = await db.select().from(youth).where(eq(youth.id, id)).limit(1)
  return results[0] as YouthRecord | undefined
}

export async function createYouth(data: Record<string, unknown>): Promise<YouthRecord> {
  const { db, youth } = useDatabase()
  const results = await db.insert(youth).values({ ...data } as any).returning()
  return results[0] as YouthRecord
}

export async function updateYouth(id: string, data: Record<string, unknown>): Promise<YouthRecord | undefined> {
  const { db, youth, driver } = useDatabase()

  const updateData: any = { ...data }

  if (driver === 'sqlite') {
    updateData.updatedAt = new Date().toISOString()
  }

  const results = await db.update(youth).set(updateData).where(eq(youth.id, id)).returning()
  return results[0] as YouthRecord | undefined
}

export async function deleteYouth(id: string): Promise<boolean> {
  const { db, youth } = useDatabase()
  const results = await db.delete(youth).where(eq(youth.id, id)).returning()
  return results.length > 0
}

export async function listYouth(params: {
  page: number
  limit: number
  search?: string
  village?: string
  isActive?: boolean
  currentlyStudying?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { db, youth } = useDatabase()
  const { page, limit, search, village, isActive, currentlyStudying, sortBy = 'createdAt', sortOrder = 'desc' } = params
  const offset = (page - 1) * limit

  const conditions = []
  if (search) {
    conditions.push(or(
      like(youth.firstName, `%${search}%`),
      like(youth.lastName, `%${search}%`),
      like(youth.phone, `%${search}%`),
      like(youth.village, `%${search}%`),
    ))
  }
  if (village) {
    conditions.push(like(youth.village, `%${village}%`))
  }
  if (isActive !== undefined) {
    conditions.push(eq(youth.isActive, isActive))
  }
  if (currentlyStudying !== undefined) {
    conditions.push(eq(youth.currentlyStudying, currentlyStudying))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const sortColumn = (youth as any)[sortBy] || youth.createdAt
  const orderFn = sortOrder === 'asc' ? asc : desc

  const [data, totalResult] = await Promise.all([
    db.select().from(youth).where(whereClause).orderBy(orderFn(sortColumn)).limit(limit).offset(offset),
    db.select({ count: count() }).from(youth).where(whereClause),
  ])

  return {
    data: (data as YouthRecord[]).map(formatYouth),
    meta: { total: totalResult[0]?.count || 0, page, limit, totalPages: Math.ceil((totalResult[0]?.count || 0) / limit) },
  }
}

export async function insertManyYouth(records: Record<string, unknown>[]): Promise<number> {
  const { db, youth } = useDatabase()
  const result = await db.insert(youth).values(records as any[]).returning()
  return result.length
}

export async function getAllYouthForExport(filter?: { search?: string, village?: string }) {
  const { db, youth } = useDatabase()

  const conditions = []
  if (filter?.search) {
    conditions.push(or(
      like(youth.firstName, `%${filter.search}%`),
      like(youth.lastName, `%${filter.search}%`),
      like(youth.village, `%${filter.search}%`),
    ))
  }
  if (filter?.village) {
    conditions.push(like(youth.village, `%${filter.village}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const data = await db.select().from(youth).where(whereClause)
  return (data as YouthRecord[]).map(formatYouth)
}

// ---- Helpers ----

function formatYouth(record: YouthRecord) {
  return {
    _id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    gender: record.gender || '',
    dateOfBirth: record.dateOfBirth || '',
    phone: record.phone || '',
    email: record.email || '',
    village: record.village || '',
    ward: record.ward || '',
    address: record.address || '',
    fatherName: record.fatherName || '',
    fatherPhone: record.fatherPhone || '',
    motherName: record.motherName || '',
    motherPhone: record.motherPhone || '',
    currentlyStudying: record.currentlyStudying,
    educationDetails: parseJson(record.educationDetails),
    activities: parseJson(record.activities),
    achievements: parseJson(record.achievements),
    interests: record.interests || '',
    careerGoal: record.careerGoal || '',
    bloodGroup: record.bloodGroup || '',
    notes: record.notes || '',
    isActive: record.isActive,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function parseJson(value: string | null): any[] {
  if (!value)
    return []
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

function formatPerson(record: PersonRecord) {
  return {
    _id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    gender: record.gender || '',
    dateOfBirth: record.dateOfBirth || '',
    phone: record.phone || '',
    email: record.email || '',
    village: record.village || '',
    ward: record.ward || '',
    address: record.address || '',
    fatherName: record.fatherName || '',
    fatherPhone: record.fatherPhone || '',
    fatherId: record.fatherId || '',
    motherName: record.motherName || '',
    motherPhone: record.motherPhone || '',
    motherId: record.motherId || '',
    maritalStatus: record.maritalStatus || '',
    spouseName: record.spouseName || '',
    spousePhone: record.spousePhone || '',
    spouseId: record.spouseId || '',
    marriageYear: record.marriageYear || null,
    numberOfChildren: record.numberOfChildren ?? null,
    notes: record.notes || '',
    isAlive: record.isAlive,
    isActive: record.isActive,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

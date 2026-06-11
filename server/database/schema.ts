import { boolean, integer as pgInteger, pgTable, text as pgText, timestamp, varchar } from 'drizzle-orm/pg-core'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// SQLite Schema
export const sqliteUsers = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('viewer'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  verificationToken: text('verification_token'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: text('reset_password_expires'),
  refreshToken: text('refresh_token'),
  lastLogin: text('last_login'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const sqlitePeople = sqliteTable('people', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender'),
  dateOfBirth: text('date_of_birth'),
  phone: text('phone'),
  email: text('email'),
  // Location
  village: text('village'),
  ward: text('ward'),
  address: text('address'),
  // Parent details
  fatherName: text('father_name'),
  fatherPhone: text('father_phone'),
  fatherId: text('father_id'),
  motherName: text('mother_name'),
  motherPhone: text('mother_phone'),
  motherId: text('mother_id'),
  // Own family
  maritalStatus: text('marital_status'),
  spouseName: text('spouse_name'),
  spousePhone: text('spouse_phone'),
  spouseId: text('spouse_id'),
  marriageYear: integer('marriage_year'),
  numberOfChildren: integer('number_of_children'),
  children: text('children', { mode: 'json' }).$defaultFn(() => []),
  // Education
  education: text('education', { mode: 'json' }).$defaultFn(() => []),
  // Meta
  notes: text('notes'),
  isAlive: integer('is_alive', { mode: 'boolean' }).notNull().default(true),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// PostgreSQL Schema
export const pgUsers = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 10 }).notNull().default('viewer'),
  isVerified: boolean('is_verified').notNull().default(false),
  verificationToken: varchar('verification_token', { length: 255 }),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  refreshToken: pgText('refresh_token'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const pgPeople = pgTable('people', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }),
  dateOfBirth: varchar('date_of_birth', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  // Location
  village: varchar('village', { length: 100 }),
  ward: varchar('ward', { length: 100 }),
  address: pgText('address'),
  // Parent details
  fatherName: varchar('father_name', { length: 100 }),
  fatherPhone: varchar('father_phone', { length: 20 }),
  fatherId: varchar('father_id', { length: 36 }),
  motherName: varchar('mother_name', { length: 100 }),
  motherPhone: varchar('mother_phone', { length: 20 }),
  motherId: varchar('mother_id', { length: 36 }),
  // Own family
  maritalStatus: varchar('marital_status', { length: 20 }),
  spouseName: varchar('spouse_name', { length: 100 }),
  spousePhone: varchar('spouse_phone', { length: 20 }),
  spouseId: varchar('spouse_id', { length: 36 }),
  marriageYear: pgInteger('marriage_year'),
  numberOfChildren: pgInteger('number_of_children'),
  children: pgText('children').$defaultFn(() => JSON.stringify([])),
  // Education
  education: pgText('education').$defaultFn(() => JSON.stringify([])),
  // Meta
  notes: pgText('notes'),
  isAlive: boolean('is_alive').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  updatedBy: varchar('updated_by', { length: 36 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Youth (Unmarried persons)
export const sqliteYouth = sqliteTable('youth', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender'),
  dateOfBirth: text('date_of_birth'),
  phone: text('phone'),
  email: text('email'),
  // Location
  village: text('village'),
  ward: text('ward'),
  address: text('address'),
  // Parent details
  fatherName: text('father_name'),
  fatherPhone: text('father_phone'),
  motherName: text('mother_name'),
  motherPhone: text('mother_phone'),
  // Education
  currentlyStudying: integer('currently_studying', { mode: 'boolean' }).notNull().default(true),
  educationDetails: text('education_details', { mode: 'json' }).$defaultFn(() => []),
  // Skills & Activities
  activities: text('activities', { mode: 'json' }).$defaultFn(() => []),
  // Achievements
  achievements: text('achievements', { mode: 'json' }).$defaultFn(() => []),
  // Interests & Goals
  interests: text('interests'),
  careerGoal: text('career_goal'),
  // Blood group
  bloodGroup: text('blood_group'),
  // Meta
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const pgYouth = pgTable('youth', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }),
  dateOfBirth: varchar('date_of_birth', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  // Location
  village: varchar('village', { length: 100 }),
  ward: varchar('ward', { length: 100 }),
  address: pgText('address'),
  // Parent details
  fatherName: varchar('father_name', { length: 100 }),
  fatherPhone: varchar('father_phone', { length: 20 }),
  motherName: varchar('mother_name', { length: 100 }),
  motherPhone: varchar('mother_phone', { length: 20 }),
  // Education
  currentlyStudying: boolean('currently_studying').notNull().default(true),
  educationDetails: pgText('education_details').$defaultFn(() => JSON.stringify([])),
  // Skills & Activities
  activities: pgText('activities').$defaultFn(() => JSON.stringify([])),
  // Achievements
  achievements: pgText('achievements').$defaultFn(() => JSON.stringify([])),
  // Interests & Goals
  interests: pgText('interests'),
  careerGoal: varchar('career_goal', { length: 255 }),
  // Blood group
  bloodGroup: varchar('blood_group', { length: 10 }),
  // Meta
  notes: pgText('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  updatedBy: varchar('updated_by', { length: 36 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Export type-safe table references (resolved at runtime based on DB_DRIVER)
export type UsersTable = typeof sqliteUsers | typeof pgUsers
export type PeopleTable = typeof sqlitePeople | typeof pgPeople
export type YouthTable = typeof sqliteYouth | typeof pgYouth

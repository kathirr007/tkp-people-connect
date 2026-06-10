import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { pgTable, varchar, text as pgText, boolean, timestamp, integer as pgInteger } from 'drizzle-orm/pg-core'

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
  email: text('email'),
  phone: text('phone'),
  street: text('street'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  organization: text('organization'),
  designation: text('designation'),
  department: text('department'),
  notes: text('notes'),
  tags: text('tags'),
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
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  street: varchar('street', { length: 200 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  organization: varchar('organization', { length: 200 }),
  designation: varchar('designation', { length: 200 }),
  department: varchar('department', { length: 200 }),
  notes: pgText('notes'),
  tags: pgText('tags'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  updatedBy: varchar('updated_by', { length: 36 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Export type-safe table references (resolved at runtime based on DB_DRIVER)
export type UsersTable = typeof sqliteUsers | typeof pgUsers
export type PeopleTable = typeof sqlitePeople | typeof pgPeople

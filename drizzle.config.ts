import { defineConfig } from 'drizzle-kit'

const driver = process.env.DB_DRIVER || 'sqlite'

export default driver === 'postgres'
  ? defineConfig({
    dialect: 'postgresql',
    schema: './server/database/schema.ts',
    out: './drizzle/migrations',
    dbCredentials: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/tkp-people-connect',
    },
  })
  : defineConfig({
    dialect: 'sqlite',
    schema: './server/database/schema.ts',
    out: './drizzle/migrations',
    dbCredentials: {
      url: process.env.SQLITE_DB_PATH || './data/database.sqlite',
    },
  })

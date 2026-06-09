import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import prompts from 'prompts'

const ENV_PATH = resolve(process.cwd(), '.env')

async function main() {
  console.log('\n  🚀 TKP People Connect - Development Server\n')

  // Check if .env exists, create from example if not
  if (!existsSync(ENV_PATH)) {
    const examplePath = resolve(process.cwd(), '.env.example')
    if (existsSync(examplePath)) {
      writeFileSync(ENV_PATH, readFileSync(examplePath, 'utf-8'))
      console.log('  Created .env from .env.example\n')
    }
  }

  // Read current DB_DRIVER from .env
  let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : ''
  const currentDriver = envContent.match(/^DB_DRIVER=(.+)$/m)?.[1]?.trim()

  const { driver } = await prompts({
    type: 'select',
    name: 'driver',
    message: 'Select database',
    choices: [
      {
        title: 'SQLite (local file, no network needed)',
        value: 'sqlite',
        description: 'Best for office/restricted networks. Data stored in ./data/database.sqlite',
      },
      {
        title: 'PostgreSQL (network database)',
        value: 'postgres',
        description: 'Requires DATABASE_URL. Best for production-like environments',
      },
    ],
    initial: currentDriver === 'postgres' ? 1 : 0,
  })

  if (!driver) {
    console.log('\n  Cancelled.\n')
    process.exit(0)
  }

  // If PostgreSQL selected, prompt for connection string if not set
  if (driver === 'postgres') {
    const currentUrl = envContent.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim()
    const hasValidUrl = currentUrl && !currentUrl.includes('username:password')

    if (!hasValidUrl) {
      const { dbUrl } = await prompts({
        type: 'text',
        name: 'dbUrl',
        message: 'PostgreSQL connection URL',
        initial: currentUrl || 'postgresql://localhost:5432/tkp-people-connect',
      })

      if (dbUrl) {
        if (envContent.match(/^DATABASE_URL=/m)) {
          envContent = envContent.replace(/^DATABASE_URL=.+$/m, `DATABASE_URL=${dbUrl}`)
        }
        else {
          envContent += `\nDATABASE_URL=${dbUrl}`
        }
      }
    }
  }

  // Update DB_DRIVER in .env
  if (envContent.match(/^DB_DRIVER=/m)) {
    envContent = envContent.replace(/^DB_DRIVER=.+$/m, `DB_DRIVER=${driver}`)
  }
  else {
    envContent = `DB_DRIVER=${driver}\n${envContent}`
  }

  writeFileSync(ENV_PATH, envContent)

  console.log(`\n  ✓ Database: ${driver === 'sqlite' ? 'SQLite (./data/database.sqlite)' : 'PostgreSQL'}`)
  console.log('  Starting Nuxt dev server...\n')

  // Start nuxt dev with the env vars
  execSync('npx nuxt dev', {
    stdio: 'inherit',
    env: { ...process.env, DB_DRIVER: driver },
  })
}

main().catch(console.error)

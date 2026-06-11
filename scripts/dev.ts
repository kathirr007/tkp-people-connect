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

  // Read current DB_DRIVER and PORT from .env
  let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : ''
  const currentDriver = envContent.match(/^DB_DRIVER=(.+)$/m)?.[1]?.trim()
  const currentPort = envContent.match(/^PORT=(\d+)$/m)?.[1]?.trim()
  const currentAppUrl = envContent.match(/^APP_URL=(.+)$/m)?.[1]?.trim()
  const currentAppUrlPort = currentAppUrl?.match(/:(\d+)(?:$|\/)/)?.[1]?.trim()
  const defaultPort = Number(currentPort || currentAppUrlPort || '3000')

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

  const { port } = await prompts({
    type: 'number',
    name: 'port',
    message: 'Select dev server port',
    initial: defaultPort,
    validate: value => (value > 0 && value < 65536 ? true : 'Enter a valid port number'),
  })

  if (!port) {
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

  // Update PORT in .env
  if (envContent.match(/^PORT=.+$/m)) {
    envContent = envContent.replace(/^PORT=.+$/m, `PORT=${port}`)
  }
  else {
    envContent += `\nPORT=${port}`
  }

  // Update APP_URL for local development when using localhost-style URLs
  const localUrlMatch = currentAppUrl?.match(/^(https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0))(?:\:\d+)?(\/.*)?$/)
  if (localUrlMatch) {
    const [, host, path] = localUrlMatch
    const appUrl = `${host}:${port}${path ?? ''}`
    if (envContent.match(/^APP_URL=/m)) {
      envContent = envContent.replace(/^APP_URL=.+$/m, `APP_URL=${appUrl}`)
    }
    else {
      envContent += `\nAPP_URL=${appUrl}`
    }
  }
  else if (!envContent.match(/^APP_URL=/m)) {
    envContent += `\nAPP_URL=http://localhost:${port}`
  }

  writeFileSync(ENV_PATH, envContent)

  console.log(`\n  ✓ Database: ${driver === 'sqlite' ? 'SQLite (./data/database.sqlite)' : 'PostgreSQL'}`)
  console.log(`  ✓ Dev port: ${port}`)
  console.log('  Starting Nuxt dev server...\n')

  // Start nuxt dev with the env vars
  execSync(`npx nuxt dev --port ${port}`, {
    stdio: 'inherit',
    env: { ...process.env, DB_DRIVER: driver, PORT: String(port) },
  })
}

main().catch(console.error)

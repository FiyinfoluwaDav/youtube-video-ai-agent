import { execSync } from 'child_process'
import dotenv from 'dotenv'
import fs from 'fs'

// Try loading .env.local
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
}

// Fallback to .env if DATABASE_URL is missing
if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
  dotenv.config({ path: '.env' })
}

console.log(
  'DATABASE_URL is:',
  process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED',
)
if (process.env.DATABASE_URL) {
  console.log('Length:', process.env.DATABASE_URL.length)
  // Do not show full secret
  console.log('Starts with:', process.env.DATABASE_URL.substring(0, 15))
} else {
  console.error('DATABASE_URL environment variable is missing!')
  process.exit(1)
}

try {
  console.log('Running prisma generate...')
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env })
} catch (e) {
  console.error('Prisma generate still failed inside Node script.')
  process.exit(1)
}

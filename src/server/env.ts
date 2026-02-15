import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
  console.log('✅ Loaded env from .env.local')
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✅ Loaded env from .env')
} else {
  console.warn('⚠️ No .env or .env.local found!')
}

console.log('Use env.ts: DATABASE_URL available:', !!process.env.DATABASE_URL)

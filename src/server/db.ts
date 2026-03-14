import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import pkg from '@prisma/client'
import { WebSocket } from 'ws'
const { PrismaClient } = pkg

// Configure Neon to use WebSocket
neonConfig.webSocketConstructor = WebSocket

// HARDCODED CONNECTION STRING FOR TESTING
const connectionString =
  'postgresql://neondb_owner:npg_XJUEuj7b6Zst@ep-mute-surf-agm1u915-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

console.log('✅ DB MODULE LOADED - Using @prisma/adapter-neon')
console.log('CONNECTION STRING:', connectionString)

// CORRECT: Pass an OBJECT with connectionString property, not the string directly
const adapter = new PrismaNeon({ connectionString })

console.log('🟢 NEON ADAPTER CREATED WITH CONNECTION STRING OBJECT')

export const prisma = new PrismaClient({ adapter })

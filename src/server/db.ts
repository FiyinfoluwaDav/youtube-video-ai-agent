import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { WebSocket } from 'ws'

// Configure Neon WebSocket
neonConfig.webSocketConstructor = WebSocket

const connectionString =
  'postgresql://neondb_owner:npg_XJUEuj7b6Zst@ep-mute-surf-agm1u915-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

console.log('✅ DB MODULE LOADED - Using @prisma/adapter-neon')

const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })

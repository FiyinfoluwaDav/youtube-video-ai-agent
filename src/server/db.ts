import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

// Use the platform's built-in WebSocket (available in Vercel Node 18+ runtime).
// Do NOT import 'ws' — its native bufferUtil addon is stripped in Vercel's
// bundled ESM environment, causing "bufferUtil.mask is not a function".
neonConfig.webSocketConstructor = globalThis.WebSocket

const connectionString = process.env.DATABASE_URL!

console.log('✅ DB MODULE LOADED - Using @prisma/adapter-neon')

const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })

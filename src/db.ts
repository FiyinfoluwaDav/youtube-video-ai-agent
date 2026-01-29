import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaPg } from '@prisma/adapter-pg'
import { WebSocket } from 'ws'
import { PrismaClient } from './generated/prisma/client.js'

neonConfig.webSocketConstructor = WebSocket

// This is required for the prisma adapter to work
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

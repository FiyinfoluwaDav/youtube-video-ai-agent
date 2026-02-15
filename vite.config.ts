import dotenv from 'dotenv'
import path from 'path'

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import neon from './neon-vite-plugin.ts'

console.log(
  '✅ Vite config loaded env. DATABASE_URL present:',
  !!process.env.DATABASE_URL,
)

export default defineConfig({
  plugins: [
    devtools(),
    neon,
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],

  optimizeDeps: {
    exclude: [
      '@prisma/client',
      '@prisma/adapter-pg',
      '@neondatabase/serverless',
    ],
  },

  server: {
    // Listen on all interfaces so ngrok/tunnel can reach it
    host: true,

    // Allow ngrok domains (wildcard covers any random subdomain)
    allowedHosts: [
      '.ngrok-free.app', // ← allows *.ngrok-free.app
      'localhost',
      '127.0.0.1',
    ],

    // Optional: if you keep getting HMR or connection issues through tunnel
    // hmr: {
    //   clientPort: 443,           // ngrok uses HTTPS
    //   protocol: 'wss',
    // },
  },
})

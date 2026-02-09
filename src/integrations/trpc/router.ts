import type { TRPCRouterRecord } from '@trpc/server'
import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { z } from 'zod'
import { sendChatRequest } from '../../lib/ollama'
import { createTRPCRouter, publicProcedure } from './init'
import { MOCK_TRANSCRIPT } from './mockData'

const execAsync = promisify(exec)

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: publicProcedure.query(() => todos),
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
} satisfies TRPCRouterRecord

const youtubeRouter = {
  getTranscript: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      console.log('--- STARTING TRANSCRIPT FETCH ---')
      console.log('Video ID:', input.videoId)

      if (input.videoId === 'mock-id') {
        console.log('Using Mock Data for Transcript')
        return MOCK_TRANSCRIPT
      }
      try {
        // Use Python script to fetch video transcript... If no transcript, use model to generate transcript
        const scriptPath = path.join(
          process.cwd(),
          'src',
          'scripts',
          'get_transcript.py',
        )
        console.log('Script path:', scriptPath)

        const { stdout } = await execAsync(
          `python "${scriptPath}" "${input.videoId}"`,
        )

        const result = JSON.parse(stdout)

        if (result.error) {
          throw new Error(result.error)
        }

        // Ensure result is an array
        if (!Array.isArray(result)) {
          throw new Error('Invalid transcript format returned from script')
        }

        return result
      } catch (error) {
        console.error('Error fetching transcript for video:', input.videoId)
        console.error(error)
        if (error instanceof Error) {
          throw new Error(`Failed to fetch transcript: ${error.message}`)
        }
        throw new Error('Failed to fetch transcript: Unknown error')
      }
    }),
} satisfies TRPCRouterRecord

const chatRouter = {
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await sendChatRequest(input.messages)
        return { content: response }
      } catch (error) {
        console.error('Error in chat.sendMessage:', error)
        throw new Error('Failed to get response from AI')
      }
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  youtube: youtubeRouter,
  chat: chatRouter,
})
export type TRPCRouter = typeof trpcRouter

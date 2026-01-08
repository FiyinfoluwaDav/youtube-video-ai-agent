import type { TRPCRouterRecord } from '@trpc/server'
import { YoutubeTranscript } from 'youtube-transcript'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from './init'

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
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(input.videoId)
        return transcript
      } catch (error) {
        console.error('Error fetching transcript:', error)
        throw new Error('Failed to fetch transcript')
      }
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  youtube: youtubeRouter,
})
export type TRPCRouter = typeof trpcRouter

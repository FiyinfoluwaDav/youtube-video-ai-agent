import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { z } from 'zod'
import { sendChatRequest } from '../../lib/ollama'
import { prisma } from '../../server/db'
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
  generateTitle: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await sendChatRequest([
          {
            role: 'system',
            content:
              'Generate a very short, concise title (max 4-5 words) for a chat that starts with the following message. Do not use quotes or anything else, just the title.',
          },
          { role: 'user', content: input.message },
        ])
        return { title: response }
      } catch (error) {
        console.error('Error in chat.generateTitle:', error)
        return { title: 'New Chat' }
      }
    }),

  getChats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return []
    }
    return await prisma.chat.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        messages: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }),

  createChat: publicProcedure
    .input(
      z.object({
        name: z.string(),
        videoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log('🔴 CREATE CHAT MUTATION CALLED')
      console.log('User ID:', ctx.userId)
      console.log('Input:', input)

      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      console.log('🔴 ABOUT TO CALL PRISMA.CHAT.CREATE')
      try {
        const result = await prisma.chat.create({
          data: {
            title: input.name,
            videoId: input.videoId,
            userId: ctx.userId,
            messages: {
              create: [],
            },
          },
          include: {
            messages: true,
          },
        })
        console.log('🟢 PRISMA.CHAT.CREATE SUCCEEDED')
        return result
      } catch (error) {
        console.error('🔴 PRISMA.CHAT.CREATE FAILED:', error)
        throw error
      }
    }),

  deleteChat: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      // Ensure user owns the chat
      const chat = await prisma.chat.findUnique({
        where: { id: input.chatId },
      })
      if (!chat || chat.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return await prisma.chat.delete({
        where: { id: input.chatId },
      })
    }),

  updateChat: publicProcedure
    .input(
      z.object({
        chatId: z.string(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      const chat = await prisma.chat.findUnique({
        where: { id: input.chatId },
      })
      if (!chat || chat.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return await prisma.chat.update({
        where: { id: input.chatId },
        data: {
          title: input.name,
        },
        include: {
          messages: true,
        },
      })
    }),

  addMessage: publicProcedure
    .input(
      z.object({
        chatId: z.string(),
        role: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      const chat = await prisma.chat.findUnique({
        where: { id: input.chatId },
      })
      if (!chat || chat.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return await prisma.message.create({
        data: {
          chatId: input.chatId,
          role: input.role,
          content: input.content,
        },
      })
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  youtube: youtubeRouter,
  chat: chatRouter,
})
export type TRPCRouter = typeof trpcRouter

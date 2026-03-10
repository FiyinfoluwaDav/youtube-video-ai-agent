import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { z } from 'zod'
import { summarizeVideoMapReduce } from '../../lib/mapReduce'
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

  summarizeVideoMapReduce: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        prompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (input.videoId === 'mock-id') {
          const finalSummary = await summarizeVideoMapReduce(
            MOCK_TRANSCRIPT,
            input.prompt,
          )
          return { content: finalSummary }
        }

        const scriptPath = path.join(
          process.cwd(),
          'src',
          'scripts',
          'get_transcript.py',
        )

        const { stdout } = await execAsync(
          `python "${scriptPath}" "${input.videoId}"`,
        )

        const result = JSON.parse(stdout)

        if (result.error) {
          throw new Error(result.error)
        }

        if (!Array.isArray(result)) {
          throw new Error('Invalid transcript format returned from script')
        }

        const finalSummary = await summarizeVideoMapReduce(result, input.prompt)

        return { content: finalSummary }
      } catch (error) {
        console.error('Error in chat.summarizeVideoMapReduce:', error)
        throw new Error('Failed to generate summary via Map-Reduce')
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
      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

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

        return result
      } catch (error) {
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

  generateMindMap: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        detailed: z.boolean().optional(),
        summary: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // 1. Check DB Cache
        const cached = await prisma.mindMap.findUnique({
          where: { videoId: input.videoId },
        })
        if (cached && !input.detailed) {
          return cached.data
        }

        // 2. Prepare content for LLM
        let contentToProcess = input.summary || ''

        if (input.detailed || !contentToProcess) {
          // Fetch transcript
          let transcriptData: any = []
          if (input.videoId === 'mock-id') {
            transcriptData = MOCK_TRANSCRIPT
          } else {
            const scriptPath = path.join(
              process.cwd(),
              'src',
              'scripts',
              'get_transcript.py',
            )

            const { stdout } = await execAsync(
              `python "${scriptPath}" "${input.videoId}"`,
            )
            const result = JSON.parse(stdout)
            if (result.error) throw new Error(result.error)
            if (!Array.isArray(result))
              throw new Error('Invalid transcript format returned from script')
            transcriptData = result
          }

          const fullText = transcriptData
            .map((t: any) => t.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (input.detailed) {
            contentToProcess = fullText
          } else {
            // Need a summary, use map reduce to save tokens for the mindmap prompt
            contentToProcess = await summarizeVideoMapReduce(
              transcriptData,
              'Provide a highly detailed structural summary of the video to be converted into a mind map.',
            )
          }
        }

        // 3. Prompt for Mind Map
        const systemPrompt = `You are a strict data formatter. Your task is to generate a JSON representing a mind map based on the user's input.
Rules:
1. Output ONLY valid JSON. No explanations, no markdown formatting blocks outside of the JSON itself (or just raw text that is purely JSON).
2. The format must exactly match: { "nodes": [{ "id": "string", "data": { "label": "string", "description": "string" }, "position": { "x": 0, "y": 0 } }], "edges": [{ "id": "string", "source": "string", "target": "string" }] }
3. The 'description' field in 'data' is strictly REQUIRED and must be a short explanation (1-2 sentences) of what the node represents in context.
4. Constraints: max 25 nodes, concise labels (max 4 words), 4-6 main branches radiating from a central root node, depth 2-3 levels.
5. Set position { x: 0, y: 0 } for all nodes (auto-layout will handle it).`

        const userPrompt = `Generate a JSON mind map for the following video content:\n\n${contentToProcess}`

        const response = await sendChatRequest([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ])

        // Parse JSON
        let jsonStr = response.trim()
        if (jsonStr.startsWith('\`\`\`json')) {
          jsonStr = jsonStr
            .replace(/^\`\`\`json/, '')
            .replace(/\`\`\`$/, '')
            .trim()
        } else if (jsonStr.startsWith('\`\`\`')) {
          jsonStr = jsonStr
            .replace(/^\`\`\`/, '')
            .replace(/\`\`\`$/, '')
            .trim()
        }

        const jsonObj = JSON.parse(jsonStr)

        if (!jsonObj.nodes || !jsonObj.edges) {
          throw new Error('Invalid JSON structure returned by LLM')
        }

        // 4. Cache and return
        if (!input.detailed) {
          await prisma.mindMap.upsert({
            where: { videoId: input.videoId },
            update: { data: jsonObj },
            create: { videoId: input.videoId, data: jsonObj },
          })
        }

        return jsonObj
      } catch (error) {
        console.error('Error in chat.generateMindMap:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate mind map',
        })
      }
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  youtube: youtubeRouter,
  chat: chatRouter,
})
export type TRPCRouter = typeof trpcRouter

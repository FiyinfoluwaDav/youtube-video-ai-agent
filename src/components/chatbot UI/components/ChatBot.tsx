import { useTRPC } from '@/integrations/trpc/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import {
  Chat,
  Message as MessageType,
  useAppContext,
} from '../context/AppContext'
import Message from './Message'

interface ChatBotProps {
  transcript?: { text: string; offset: number; duration: number }[]
  currentTime?: number
  videoId: string
}

// Helper to get relevant transcript segments
const getRelevantTranscript = (
  transcript: { text: string; offset: number; duration: number }[],
  currentTime: number,
  query: string,
  maxChars = 12000, // Approx 3000 tokens
) => {
  if (!transcript || transcript.length === 0) return ''

  const currentContextWindow = 300 // seconds
  const currentSegments = transcript.filter(
    (t) =>
      t.offset >= currentTime - currentContextWindow &&
      t.offset <= currentTime + currentContextWindow,
  )

  const keywords = query
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 3)

  const keywordSegments =
    keywords.length > 0
      ? transcript.filter(
          (t) =>
            !currentSegments.includes(t) && // Avoid duplicates
            keywords.some((k) => t.text.toLowerCase().includes(k)),
        )
      : []

  let combinedSegments = [...currentSegments, ...keywordSegments]

  combinedSegments.sort((a, b) => a.offset - b.offset)

  // formatting
  let formatted = combinedSegments
    .map(
      (t) =>
        `[${Math.floor(t.offset / 60)}:${String(
          Math.floor(t.offset % 60),
        ).padStart(2, '0')}] ${t.text}`,
    )
    .join('\n')

  // Truncate if too long (simple char limit)
  if (formatted.length > maxChars) {
    formatted = formatted.slice(0, maxChars) + '\n... (truncated)'
  }

  return formatted
}

const ChatBot = ({ transcript, currentTime, videoId }: ChatBotProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    theme,
    updateChat,
  } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([])

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')

  const trpc = useTRPC()
  const { mutateAsync: sendMessage } = useMutation(
    trpc.chat.sendMessage.mutationOptions(),
  )
  const { mutateAsync: generateTitle } = useMutation(
    trpc.chat.generateTitle.mutationOptions(),
  )

  const { mutateAsync: createChat } = useMutation(
    trpc.chat.createChat.mutationOptions(),
  )
  const { mutateAsync: addMessage } = useMutation(
    trpc.chat.addMessage.mutationOptions(),
  )
  const queryClient = useQueryClient()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const currentPrompt = prompt
    const userMessage: MessageType = {
      role: 'user',
      content: currentPrompt,
      isImage: false,
      isPublished: false,
      timestamp: Date.now(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setPrompt('')

    try {
      let chatId = selectedChat?.id
      let currentChat = selectedChat

      if (!chatId) {
        const newChatData = await createChat({
          name: currentPrompt.slice(0, 40),
          videoId,
        })
        chatId = newChatData.id

        // Construct app chat object from response
        const newChatApp: Chat = {
          id: newChatData.id,
          userId: newChatData.userId || user?.id || '',
          videoId: newChatData.videoId,
          name: newChatData.title || currentPrompt.slice(0, 40),
          userName: user?.name || 'User',
          messages: [],
          createdAt: newChatData.createdAt.toISOString(),
          updatedAt: newChatData.updatedAt.toISOString(),
        }

        currentChat = newChatApp
        setSelectedChat(newChatApp)
        // Invalidate chats query to update sidebar
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getChats.queryOptions().queryKey,
        })
      }

      // Save user message
      await addMessage({
        chatId: chatId!,
        role: 'user',
        content: currentPrompt,
      })

      const messagesToSend = newMessages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }))

      if (transcript && transcript.length > 0) {
        const formattedTranscript = getRelevantTranscript(
          transcript,
          currentTime || 0,
          currentPrompt,
        )

        const systemMessage = {
          role: 'system' as const,
          content: `You are a smart, nerdy and funny assistant helping people understand videos. 
Here is the relevant transcript of the video (filtered for context):
${formattedTranscript}

The user is currently watching at timestamp: ${
            currentTime
              ? `${Math.floor(currentTime / 60)}:${String(
                  Math.floor(currentTime % 60),
                ).padStart(2, '0')}`
              : '0:00'
          }.
Answer questions based on this transcript and context but make sure you do not include words like 'based on this transcript' or 'based on the context' The user should not be aware of the transcript being used for the context.`,
        }
        messagesToSend.unshift(systemMessage)
      }

      const response = await sendMessage({
        messages: messagesToSend,
      })

      const assistantMessage: MessageType = {
        role: 'assistant',
        content: response.content,
        isImage: false,
        isPublished: false,
        timestamp: Date.now(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Save assistant message
      await addMessage({
        chatId: chatId!,
        role: 'assistant',
        content: response.content,
      })

      // Update selected chat messages in memory
      if (currentChat) {
        const updatedChat = { ...currentChat, messages: finalMessages }
        setSelectedChat(updatedChat)
      }

      // Generate title for new chats
      if (!selectedChat && messages.length === 0) {
        try {
          const { title } = await generateTitle({ message: currentPrompt })
          if (title) {
            updateChat({ ...currentChat!, name: title })
          }
        } catch (error) {
          console.error('Failed to generate title:', error)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          isImage: false,
          isPublished: false,
          timestamp: Date.now(),
        },
      ])
      console.error('Full error details:', JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    } else {
      setMessages([])
    }
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 max-md:pt-14 h-full min-h-0">
      {/* Chat Messages */}
      <div
        ref={containerRef}
        className="flex-1 mb-5 overflow-y-auto custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 text-primary h-full">
            <img
              src={theme === 'light' ? assets.logo_full_dark : assets.logo_full}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything...
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <Message message={message} key={index} />
        ))}

        {/* Error Message */}
        {/* Error Message */}
        {/* Show error if last message failed or general error */}
        {/* (Assuming we handle error state in component) */}

        {/* Three Dots Loading */}
        {loading && (
          <div className="flex items-center loader gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce delay-100"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce delay-200"></div>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-gray-100 dark:bg-[#202020] rounded-full w-full max-w-2xl p-2 px-4 mx-auto flex gap-4 items-center focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-700 transition-all shadow-sm"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-2 pr-2 outline-none bg-transparent dark:text-gray-300 font-medium"
        >
          <option className="dark:bg-[#202020]" value="text">
            Text
          </option>
          <option className="dark:bg-[#202020]" value="image">
            Image
          </option>
        </select>
        <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Ask anything..."
          required
          className="flex-1 w-full text-sm outline-none bg-transparent dark:text-white placeholder:text-gray-500"
        />
        <button
          disabled={loading}
          type="submit"
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt=""
            className="w-5 h-5 cursor-pointer opacity-60 grayscale dark:invert dark:opacity-80"
          />
        </button>
      </form>
    </div>
  )
}

export default ChatBot

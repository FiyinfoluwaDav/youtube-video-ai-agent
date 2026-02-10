import { useTRPC } from '@/integrations/trpc/react'
import { useMutation } from '@tanstack/react-query'
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
}

const ChatBot = ({ transcript, currentTime }: ChatBotProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selectedChat, setSelectedChat, user, chats, setChats, theme } =
    useAppContext()
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([])

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')

  const trpc = useTRPC()
  const { mutateAsync: sendMessage } = useMutation(
    trpc.chat.sendMessage.mutationOptions(),
  )

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
      const messagesToSend = newMessages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }))

      if (transcript && transcript.length > 0) {
        const formattedTranscript = transcript
          .map(
            (t) =>
              `[${Math.floor(t.offset / 60)}:${String(
                Math.floor(t.offset % 60),
              ).padStart(2, '0')}] ${t.text}`,
          )
          .join('\n')

        const systemMessage = {
          role: 'system' as const,
          content: `You are an AI assistant helping a user with a video. 
Here is the transcript of the video:
${formattedTranscript}

The user is currently watching at timestamp: ${
            currentTime
              ? `${Math.floor(currentTime / 60)}:${String(
                  Math.floor(currentTime % 60),
                ).padStart(2, '0')}`
              : '0:00'
          }.
Answer questions based on this transcript and context.`,
        }
        messagesToSend.unshift(systemMessage)
      }

      const response = await sendMessage({
        messages: messagesToSend,
      })

      const assistantMessage: MessageType = {
        role: 'assistant',
        content: response.content,
        isImage: false, // Assuming text response for now, update logic if response includes image
        isPublished: false,
        timestamp: Date.now(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Save to Chat Storage
      let updatedChat: Chat
      let updatedChats: Chat[]

      if (selectedChat) {
        updatedChat = {
          ...selectedChat,
          messages: finalMessages,
          updatedAt: new Date().toISOString(),
        }
        updatedChats = chats
          ? chats.map((c) => (c.id === selectedChat.id ? updatedChat : c))
          : [updatedChat]
      } else {
        updatedChat = {
          id: Date.now().toString(),
          userId: user?.id || 'guest',
          name: currentPrompt.slice(0, 40),
          userName: user?.name || 'Guest',
          messages: finalMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        updatedChats = [updatedChat, ...(chats || [])]
      }

      setChats(updatedChats)
      setSelectedChat(updatedChat)
      localStorage.setItem('chats', JSON.stringify(updatedChats))
    } catch (error) {
      console.error('Error sending message:', error)
      // Optionally add an error message to the chat
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
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 max-md:mt-14 h-full">
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

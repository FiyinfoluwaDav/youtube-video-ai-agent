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
    theme,
    updateChat,
    credits,
    maxCredits,
    consumeCredit,
  } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([])

  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (prompt === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [prompt])

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

    // Credit check — block if no credits remaining
    if (credits <= 0) {
      return
    }

    // Consume one credit before proceeding
    const consumed = consumeCredit()
    if (!consumed) {
      return
    }

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
          messages: newMessages,
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
        {messages.length === 0 && !loading && (
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

      {/* Credit Counter */}
      <div className="flex justify-center mb-2">
        {credits <= 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <span>No credits left, come back tomorrow or login</span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              credits <= 2
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
            }`}
          >
            <span>
              {credits} / {maxCredits} credits
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-3 mb-4 w-full max-w-2xl mx-auto px-2">
        <button
          onClick={() => {
            if (credits > 0) {
              setPrompt(
                'Summarize this video to a PDF. Please ensure it is properly formatted with bold text, H1, H3, and contains all the important information in the video.',
              )
              // Wait for React to update state, then submit
              setTimeout(() => {
                if (textareaRef.current) {
                  const fakeEvent = {
                    preventDefault: () => {},
                  } as React.FormEvent
                  onSubmit(fakeEvent)
                }
              }, 50)
            }
          }}
          className="flex-1 flex flex-col items-start p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202020] hover:bg-gray-50 dark:hover:bg-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1.5 text-blue-500 dark:text-blue-400">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span className="font-medium text-sm">Summarize video to PDF</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
            Detailed summary with H1, H3, and bold formatting.
          </p>
        </button>

        <button
          onClick={() => {
            if (credits > 0) {
              setPrompt(
                'Generate a comprehensive mindmap for this video detailing all the key topics and subtopics.',
              )
              setTimeout(() => {
                if (textareaRef.current) {
                  const fakeEvent = {
                    preventDefault: () => {},
                  } as React.FormEvent
                  onSubmit(fakeEvent)
                }
              }, 50)
            }
          }}
          className="flex-1 flex flex-col items-start p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202020] hover:bg-gray-50 dark:hover:bg-white/5 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1.5 text-purple-500 dark:text-purple-400">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span className="font-medium text-sm">Generate Mindmap</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
            Visual mapping of topics and concepts.
          </p>
        </button>
      </div>

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-gray-100 dark:bg-[#202020] rounded-3xl w-full max-w-2xl p-2 px-4 mx-auto flex gap-4 items-end focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-700 transition-all shadow-sm"
      >
        <textarea
          ref={textareaRef}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (prompt.trim() && !loading && credits > 0) {
                const fakeEvent = {
                  preventDefault: () => {},
                } as React.FormEvent
                onSubmit(fakeEvent)
              }
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
          value={prompt}
          rows={1}
          placeholder="Ask anything..."
          className="flex-1 w-full text-sm outline-none bg-transparent dark:text-white placeholder:text-gray-500 resize-none py-2 my-0.5 custom-scrollbar max-h-48"
        />
        <button
          disabled={loading || credits <= 0 || !prompt.trim()}
          type="submit"
          className="p-1.5 mb-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

import { getCreditsState, getMaxCredits } from '@/hooks/useCredits'
import { useTRPC } from '@/integrations/trpc/react'
import type { TRPCRouter } from '@/integrations/trpc/router'
import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inferRouterOutputs } from '@trpc/server'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type RouterOutput = inferRouterOutputs<TRPCRouter>
type ServerChat = RouterOutput['chat']['getChats'][number]
type ServerMessage = ServerChat['messages'][number]

// import { dummyUserData } from '../assets/assets'

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  chats: Chat[] | null
  setChats: (chats: Chat[] | null) => void
  theme: string
  setTheme: (theme: string) => void
  selectedChat: Chat | null
  setSelectedChat: (chat: Chat | null) => void
  credits: number
  maxCredits: number
  consumeCredit: () => boolean
  setCredits: (credits: number) => void
  updateChat: (chat: Chat) => void
  deleteChat: (chatId: string) => void
}

export interface User {
  id: string
  name: string
  email: string
  credits: number
}

export interface Message {
  isImage: boolean
  isPublished: boolean
  role: string
  content: string
  timestamp: number
}

// Updated Chat interface to match frontend usage but mapped from backend
export interface Chat {
  id: string
  userId: string
  videoId: string
  name: string
  userName: string
  messages: Message[]
  createdAt: string
  updatedAt?: string
}

const AppContext = createContext<AppContextType | null>(null)

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser } = useUser()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [theme, setTheme] = useState<string>('dark')

  // Credit state — initialize with max credits to avoid hydration mismatches between server/client
  const userId = clerkUser?.id ?? null
  const [credits, setCredits] = useState<number>(() => getMaxCredits(userId))

  // Sync credits with localStorage whenever login state changes or on initial mount
  useEffect(() => {
    const state = getCreditsState(userId)
    setCredits(state.credits)
  }, [userId])

  const consumeCredit = useCallback((): boolean => {
    const state = getCreditsState(userId)
    const consumed = state.consume()
    if (consumed) {
      setCredits(getCreditsState(userId).credits)
    }
    return consumed
  }, [userId])

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const chatInternal = trpc.chat.getChats.queryOptions()
  const { data: serverChats } = useQuery({
    queryKey: chatInternal.queryKey,
    queryFn: chatInternal.queryFn,
    enabled: !!clerkUser,
  })

  useEffect(() => {
    if (!clerkUser) {
      queryClient.removeQueries({
        queryKey: trpc.chat.getChats.queryOptions().queryKey,
      })
      setSelectedChat(null)
    }
  }, [clerkUser, queryClient, trpc])

  const updateChatMutation = useMutation({
    ...trpc.chat.updateChat.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.chat.getChats.queryOptions().queryKey,
      })
    },
  })

  const deleteChatMutation = useMutation({
    ...trpc.chat.deleteChat.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.chat.getChats.queryOptions().queryKey,
      })
    },
  })

  // Map server chats to app chats
  // We use a safe mapping to avoid runtime crashes if data structure mismatches temporarily
  // Map server chats to app chats
  // We use a safe mapping to avoid runtime crashes if data structure mismatches temporarily
  const chats: Chat[] | null =
    clerkUser && serverChats
      ? (serverChats as RouterOutput['chat']['getChats']).map(
          (c: ServerChat) => ({
            id: c.id,
            userId: c.userId || '',
            videoId: c.videoId,
            name: c.title || 'New Chat',
            userName: clerkUser?.fullName || 'User',
            messages: c.messages.map((m: ServerMessage) => ({
              role: m.role,
              content: m.content,
              isImage: false, // Default
              isPublished: false, // Default
              timestamp: new Date(m.createdAt).getTime(),
            })),
            createdAt: new Date(c.createdAt).toISOString(),
            updatedAt: new Date(c.updatedAt).toISOString(),
          }),
        )
      : []

  // Derived user object
  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        credits: 10, // Placeholder until we persist credits
      }
    : null

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const updateChat = (chat: Chat) => {
    // We only update name via this function usually in Sidebar
    // For local state, we rely on refetching, but for smooth UI we might want to update cache.
    // For now, simple mutation.
    updateChatMutation.mutate({ chatId: chat.id, name: chat.name })

    // Also update selected chat if it's the one being updated
    if (selectedChat?.id === chat.id) {
      setSelectedChat(chat)
    }
  }

  const deleteChat = (chatId: string) => {
    deleteChatMutation.mutate({ chatId })
    if (selectedChat?.id === chatId) {
      setSelectedChat(null)
    }
  }

  // Deprecated, use mutations
  const setChats = (_newChats: Chat[] | null) => {
    console.warn('setChats is deprecated. Use tRPC mutations instead.')
  }

  const value = {
    user,
    setUser: () => {}, // No-op
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    credits,
    maxCredits: getCreditsState(userId).maxCredits,
    consumeCredit,
    setCredits,
    updateChat,
    deleteChat,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === null) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}

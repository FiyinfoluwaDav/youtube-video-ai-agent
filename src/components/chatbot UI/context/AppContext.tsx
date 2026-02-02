import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { dummyChats, dummyUserData } from '../assets/assets'

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
  setCredits: (credits: number) => void
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

export interface Chat {
  id: string
  userId: string
  name: string
  userName: string
  messages: Message[]
  createdAt: string
  updatedAt?: string
}

const AppContext = createContext<AppContextType | null>(null)

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[] | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [theme, setTheme] = useState<string>('dark')
  const [credits, setCredits] = useState<number>(0)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  const fetchUser = async () => {
    setUser(dummyUserData)
  }

  const fetchUsersChat = async () => {
    // @ts-ignore
    setChats(dummyChats)
    // @ts-ignore
    setSelectedChat(dummyChats[0])
  }

  useEffect(() => {
    if (user) {
      fetchUsersChat()
      setCredits(user.credits)
    } else {
      setChats([])
      setSelectedChat(null)
      setCredits(0)
    }
  }, [user])

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const value = {
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    credits,
    setCredits,
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

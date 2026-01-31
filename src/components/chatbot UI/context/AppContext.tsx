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
}

interface User {
  id: string
  name: string
  email: string
}

interface Message {
  isImage: boolean
  isPublished: boolean
  role: string
  content: string
  timestamp: number
}

interface Chat {
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
  const [theme, setTheme] = useState<string>(
    localStorage.getItem('theme') || 'dark',
  )

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
    } else {
      setChats([])
      setSelectedChat(null)
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
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}

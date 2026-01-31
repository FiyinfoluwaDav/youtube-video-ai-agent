import { History, Settings } from 'lucide-react'
import { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Sidebar = () => {
  const { chats, selectedChat, setSelectedChat, theme } = useAppContext()

  const [search, setSearch] = useState('')

  return (
    <div className="w-16 lg:w-64 h-full bg-slate-900 border-r border-white/10 flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="p-4 flex items-center justify-center lg:justify-start gap-3 border-b border-white/10 h-16">
        <div
          className="flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl
        transition-all duration-500 max-md:absolute left-0 z-1"
        >
          {/*Logo */}
          <img
            src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
            alt=""
            className="w-full max-w-48"
          />
        </div>
        <span className="font-semibold text-slate-200 hidden lg:block truncate">
          New Chat
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
        <div className="px-2 pb-2 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:block">
          History
        </div>
        {/* Placeholder for history items */}
        {chats?.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`w-full p-2 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-colors group ${
              selectedChat?.id === chat.id
                ? 'bg-white/10 text-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm truncate hidden lg:block">
              {chat.name || 'New Chat'}
            </span>
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-white/10">
        <button className="w-full p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 flex items-center gap-3 transition-colors justify-center lg:justify-start">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium hidden lg:block">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

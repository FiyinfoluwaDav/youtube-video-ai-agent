import { Link } from '@tanstack/react-router'
import moment from 'moment'
import { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Sidebar = () => {
  const { credits, chats, selectedChat, setSelectedChat, theme } =
    useAppContext()

  const [search, setSearch] = useState('')

  return (
    <div
      className="flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl
        transition-all duration-500 max-md:absolute left-0 z-1"
    >
      {/*Logo */}
      <img
        src={theme === 'light' ? assets.logo_full : assets.logo_full_dark}
        alt=""
        className="w-full max-w-48"
      />

      {/*New Chat Button*/}
      <button className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer">
        <span className="mr-2 text-xl">+</span>
        New Chat
      </button>

      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} alt="" className="w-4 not-dark:invert" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-xs placeholder:text-gray-400 outline-none w-full bg-transparent"
        />
      </div>

      {/*Recent Chats*/}
      {chats && chats.length > 0 && (
        <p className="text-sm mt-4 text-gray-400">Recent Chats</p>
      )}
      <div className="flex-1 mt-3 text-sm space-y-3">
        {chats
          ?.filter((chat) =>
            chat.messages[0]
              ? chat.messages[0].content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-2 px-4 border rounded-md cursor-pointer flex justify-between group transition-colors ${
                selectedChat?.id === chat.id
                  ? 'bg-blue-50 dark:bg-[#57317C]/30 border-blue-200 dark:border-[#80609F]/50'
                  : 'hover:bg-gray-50 dark:hover:bg-[#57317C]/10 border-gray-200 dark:border-[#80609F]/15 bg-white dark:bg-transparent'
              }`}
            >
              <div className="w-full overflow-hidden">
                <p className="truncate w-full font-medium text-gray-700 dark:text-gray-200">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0] mt-1">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
            </div>
          ))}
      </div>
      {/*Credit Purchase Option*/}
      <Link
        to="/credits"
        className="flex items-center gap-2 cursor-pointer p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md hover:scale-103 transition-all duration-200"
      >
        <img
          src={assets.diamond_icon}
          className="w-4.5 not-dark:invert"
          alt=""
        />
        <div className="flex flex-col text-sm">
          <p>Credit : {credits}</p>
          <p className="text-gray-500 text-xs">
            Purchase credits to use Summara
          </p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar

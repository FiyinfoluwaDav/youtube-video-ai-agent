import { Link } from '@tanstack/react-router'
import moment from 'moment'
import { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Sidebar = ({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean
  setIsMenuOpen: (isMenuOpen: boolean) => void
}) => {
  const {
    credits,
    chats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    user,
  } = useAppContext()

  const [search, setSearch] = useState('')

  return (
    <div
      className={`flex flex-col h-full min-w-72 p-5 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/5
        transition-all duration-500 max-md:absolute left-0 z-50 ${!isMenuOpen && 'max-md:-translate-x-full'}`}
    >
      {/*Logo */}
      <img
        src={theme === 'light' ? assets.logo_full_dark : assets.logo_full}
        alt=""
        className="w-full max-w-40 opacity-90"
      />

      {/*New Chat Button*/}
      <button
        className="flex justify-center items-center w-full py-2.5 mt-8 text-sm font-medium rounded-lg cursor-pointer
        bg-gray-900 text-white hover:bg-black
        dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-200"
      >
        <span className="mr-2 text-xl font-light">+</span>
        New Chat
      </button>

      <div className="flex items-center gap-2 p-2.5 mt-6 bg-gray-200 dark:bg-[#2c2c2c] rounded-lg">
        <img
          src={assets.search_icon}
          alt=""
          className="w-4 opacity-50 invert dark:invert-0"
        />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search"
          className="text-sm placeholder:text-gray-500 outline-none w-full bg-transparent dark:text-gray-200"
        />
      </div>

      {/*Recent Chats*/}
      {chats && chats.length > 0 && (
        <p className="text-sm font-bold mt-8 text-black dark:text-white uppercase tracking-wider pl-1">
          Recent
        </p>
      )}
      <div className="flex-1 mt-2 -mx-2 overflow-y-auto">
        <div className="space-y-1 px-2">
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
                onClick={() => {
                  setSelectedChat(chat)
                  setIsMenuOpen(false)
                  ;<Link to="/" />
                }}
                className={`p-2.5 px-3 rounded-lg cursor-pointer flex justify-between group transition-all duration-200 ${
                  selectedChat?.id === chat.id
                    ? 'bg-gray-200 dark:bg-[#2c2c2c]'
                    : 'hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
                }`}
              >
                <div className="w-full overflow-hidden">
                  <p
                    className={`truncate w-full text-sm ${selectedChat?.id === chat.id ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    {chat.messages.length > 0
                      ? chat.messages[0].content.slice(0, 32)
                      : chat.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                    {moment(chat.updatedAt).fromNow()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 space-y-1">
        {/*Credit Purchase Option*/}
        <Link
          to="/credits"
          className="flex items-center gap-3 cursor-pointer p-2.5 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2c2c2c] transition-colors duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src={assets.diamond_icon}
            className="w-4.5 opacity-70 dark:invert"
            alt=""
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Credits: {credits}
            </p>
          </div>
        </Link>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between gap-3 cursor-pointer p-2.5 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2c2c2c] transition-colors duration-200">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            <img
              src={assets.theme_icon}
              className="w-4.5 opacity-70 invert dark:invert-0"
              alt=""
            />
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/20"></div>
          </label>
        </div>

        {/* User Account */}
        <div className="flex items-center gap-3 cursor-pointer p-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#111] transition-colors duration-200">
          <img
            src={assets.user_icon}
            className="w-8 h-8 rounded-full bg-gray-200"
            alt=""
          />
          <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
            {user ? user.name : 'Login'}
          </p>
          {user && (
            <img
              src={assets.logout_icon}
              className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer dark:invert"
              alt=""
            />
          )}
        </div>
      </div>

      <div>
        <img
          onClick={() => setIsMenuOpen(false)}
          src={assets.close_icon}
          className="absolute top-4 right-4 w-5 h-5 cursor-pointer md:hidden opacity-50 dark:invert"
          alt=""
        />
      </div>
    </div>
  )
}

export default Sidebar

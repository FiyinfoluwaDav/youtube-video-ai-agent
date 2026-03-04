import { useClerk, useUser } from '@clerk/clerk-react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronsLeft } from 'lucide-react'
import { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { ClientDate } from './ClientDate'

const Sidebar = ({
  setIsMenuOpen,
  videoId: propVideoId,
  toggleSidebar,
}: {
  isMenuOpen: boolean
  setIsMenuOpen: (isMenuOpen: boolean) => void
  videoId?: string
  toggleSidebar?: () => void
  isSidebarCollapsed?: boolean
}) => {
  const {
    credits,
    chats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    user,
    updateChat,
    deleteChat,
  } = useAppContext()

  const { signOut } = useClerk()
  const { isLoaded } = useUser()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const handleRename = (chatId: string) => {
    if (renamingChatId === chatId) {
      if (renameValue.trim()) {
        const chatToUpdate = chats?.find((c) => c.id === chatId)
        if (chatToUpdate) {
          updateChat({ ...chatToUpdate, name: renameValue })
        }
      }
      setRenamingChatId(null)
      setRenameValue('')
    }
  }

  const { videoId: paramsVideoId } = useParams({
    strict: false,
  }) as { videoId?: string }
  const videoId = propVideoId || paramsVideoId

  return (
    <div
      className={`flex flex-col h-full w-full p-5 bg-white dark:bg-[#0a0a0a] border-r border-gray-300 dark:border-white/13
        transition-all duration-500`}
    >
      <div className="flex items-center justify-between mb-2">
        {/*Logo */}
        <Link to="/" onClick={() => setIsMenuOpen(false)}>
          <img
            src={theme === 'light' ? assets.logo_full_dark : assets.logo_full}
            alt="Summara Logo"
            className="w-full max-w-[140px] opacity-90 cursor-pointer"
          />
        </Link>

        {/* Collapse Button (Desktop Only) */}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setIsMenuOpen(false)
            } else {
              toggleSidebar?.()
            }
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors block group"
          title="Collapse Sidebar"
        >
          <ChevronsLeft className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
        </button>
      </div>

      {/*New Chat Button*/}
      <button
        onClick={() => {
          setSelectedChat(null)
          setIsMenuOpen(false)
          // Only navigate if we're not already on a video page or if we are on a DIFFERENT video page (which shouldn't happen here usually)
          if (!videoId) {
            navigate({ to: '/' })
          }
        }}
        className="flex justify-center items-center w-full py-2.5 mt-7 text-sm font-medium rounded-lg cursor-pointer
        bg-gray-900 text-white hover:bg-black
        dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-200"
      >
        <img
          src={assets.message_icon}
          alt=""
          className="w-5 h-5 mr-3 invert dark:invert-0"
        />
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
            .sort(
              (a, b) =>
                new Date(b.updatedAt || 0).getTime() -
                new Date(a.updatedAt || 0).getTime(),
            )
            .map((chat) => (
              <div
                key={chat.id}
                className={`p-2.5 px-3 rounded-lg cursor-pointer flex justify-between group transition-all duration-200 relative ${
                  selectedChat?.id === chat.id
                    ? 'bg-gray-200 dark:bg-[#2c2c2c]'
                    : 'hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedChat(chat)
                    setIsMenuOpen(false)
                    if (chat.videoId) {
                      navigate({
                        to: '/video/$videoId',
                        params: { videoId: chat.videoId },
                      })
                    } else {
                      alert(
                        'This chat is missing video information and cannot be opened directly.',
                      )
                    }
                  }}
                  className="w-full overflow-hidden"
                >
                  {renamingChatId === chat.id ? (
                    <input
                      type="text"
                      className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-white border-b border-primary"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id)
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p
                      className={`truncate w-full text-sm ${selectedChat?.id === chat.id ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      {chat.name}
                    </p>
                  )}
                  <ClientDate
                    timestamp={chat.updatedAt}
                    format="fromNow"
                    className="text-xs text-gray-400 dark:text-gray-600 mt-0.5"
                  />
                </div>
                {renamingChatId !== chat.id && (
                  <div className="absolute right-2 top-2.5 hidden group-hover:flex items-center gap-2 bg-gray-200 dark:bg-[#2c2c2c] pl-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setRenamingChatId(chat.id)
                        setRenameValue(chat.name)
                      }}
                      className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Rename"
                    >
                      <img
                        src={assets.rename_icon}
                        alt="Rename"
                        className="w-3.5 h-3.5 opacity-60 invert dark:invert-0"
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat.id)
                      }}
                      className="p-1 hover:bg-transparent rounded-full transition-colors group/delete"
                      title="Delete"
                    >
                      <img
                        src={assets.bin_icon}
                        alt="Delete"
                        className="w-3.5 h-3.5 opacity-60 invert dark:invert-0 group-hover/delete:opacity-100 group-hover/delete:filter-[brightness(0)_saturate(100%)_invert(25%)_sepia(91%)_saturate(6250%)_hue-rotate(356deg)_brightness(94%)_contrast(113%)] dark:group-hover/delete:filter-[brightness(0)_saturate(100%)_invert(25%)_sepia(91%)_saturate(6250%)_hue-rotate(356deg)_brightness(94%)_contrast(113%)]"
                      />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 space-y-1">
        {/*Credit Display*/}
        <div className="flex items-center gap-3 p-2.5 px-3 rounded-lg">
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
        </div>

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

        {/* User Account & Auth Actions */}
        {!isLoaded ? (
          // Loading skeleton or just empty space to match server if we want,
          // but better to render a placeholder that matches "Login" size to minimize shift,
          // OR just don't render this part until loaded.
          // For hydration safety, if we render NOTHING here on server, we must match on client.
          // But server might render "Login" or "Nothing".
          // Simplest fix: Client Only render for this part.
          <div className="animate-pulse flex items-center gap-3 p-2.5 px-3">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3 p-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#111] transition-colors duration-200">
              <img
                src={user.imageUrl || assets.user_icon}
                className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                alt="User Profile"
              />
              <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {user.name}
              </p>
            </div>
            <button
              onClick={() => signOut(() => navigate({ to: '/' }))}
              className="flex w-full items-center gap-3 cursor-pointer p-2.5 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2c2c2c] transition-colors duration-200 text-left"
            >
              <img
                src={assets.logout_icon}
                className="w-4.5 opacity-70 invert dark:invert-0"
                alt=""
              />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Log Out
              </p>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 cursor-pointer p-2.5 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2c2c2c] transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={assets.user_icon}
              className="w-4.5 h-4.5 opacity-70 invert dark:invert-0"
              alt=""
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Log In
            </p>
          </Link>
        )}
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

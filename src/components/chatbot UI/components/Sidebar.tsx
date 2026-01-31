import { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Sidebar = () => {
  const { chats, selectedChat, setSelectedChat, theme } = useAppContext()

  const [search, setSearch] = useState('')

  return (
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
  )
}

export default Sidebar

import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Message, useAppContext } from '../context/AppContext'
const ChatBot = () => {
  const { selectedChat, theme } = useAppContext()
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat Messages */}
      <div className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === 'light' ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything...
            </p>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <form></form>
    </div>
  )
}

export default ChatBot

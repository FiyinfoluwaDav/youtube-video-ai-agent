import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Message as MessageType, useAppContext } from '../context/AppContext'
import Message from './Message'

const ChatBot = () => {
  const { selectedChat, theme } = useAppContext()
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([])

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 max-md:mt-14 h-full">
      {/* Chat Messages */}
      <div className="flex-1 mb-5 overflow-y-auto">
        {messages.length === 0 && (
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
      </div>

      {/* Prompt Input Box */}
      <form></form>
    </div>
  )
}

export default ChatBot

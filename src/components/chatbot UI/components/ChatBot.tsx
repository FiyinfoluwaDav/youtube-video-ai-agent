import { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { Message as MessageType, useAppContext } from '../context/AppContext'
import Message from './Message'

const ChatBot = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selectedChat, theme } = useAppContext()
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([])

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [published, isPublished] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: prompt,
        isImage: false,
        isPublished: false,
        timestamp: Date.now(),
      },
    ])
    setPrompt('')
    setLoading(false)
  }
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 max-md:mt-14 h-full">
      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-auto">
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

        {/* Three Dots Loading */}
        {loading && (
          <div className="flex items-center loader gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce delay-100"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce delay-200"></div>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-gray-100 dark:bg-[#202020] rounded-full w-full max-w-2xl p-2 px-4 mx-auto flex gap-4 items-center focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-700 transition-all shadow-sm"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-2 pr-2 outline-none bg-transparent dark:text-gray-300 font-medium"
        >
          <option className="dark:bg-[#202020]" value="text">
            Text
          </option>
          <option className="dark:bg-[#202020]" value="image">
            Image
          </option>
        </select>
        <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Ask anything..."
          required
          className="flex-1 w-full text-sm outline-none bg-transparent dark:text-white placeholder:text-gray-500"
        />
        <button
          disabled={loading}
          type="submit"
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt=""
            className="w-5 h-5 cursor-pointer opacity-60 grayscale dark:invert dark:opacity-80"
          />
        </button>
      </form>
    </div>
  )
}

export default ChatBot

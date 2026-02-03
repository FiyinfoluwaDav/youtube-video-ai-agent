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
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2l p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-3 pr-2 outline-none"
        >
          <option className="dark:bg-purple-900" value="text">
            Text
          </option>
          <option className="dark:bg-purple-900" value="image">
            Image
          </option>
        </select>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Enter your prompt here..."
          required
          className="flex-1 w-full text-sm outline-none"
        />
        <button disabled={loading} type="submit">
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt=""
            className="w-8 cursor-pointer"
          />
        </button>
      </form>
    </div>
  )
}

export default ChatBot

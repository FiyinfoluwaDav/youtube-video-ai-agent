import { MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'

const ChatBot = () => {
  const [chatInput, setChatInput] = useState('')

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full">
      <div className="p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-slate-200">AI Chat Assistant</h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-500 gap-4 overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">Chat with your video transcript</p>
        <p className="text-sm opacity-60 text-center max-w-sm">
          Ask questions, request summaries, or analyze the content of the video.
        </p>
      </div>

      <div className="p-4 border-t border-white/10 bg-slate-900/30">
        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask something about the video..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder:text-slate-600"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-400">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBot

import { extractVideoId } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, Sparkles, Youtube } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const videoId = extractVideoId(url)
    if (!videoId) {
      setError('Invalid YouTube URL')
      return
    }
    navigate({ to: '/video/$videoId', params: { videoId } })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
            <Youtube className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            YouTube AI Agent
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Transform video content into interactive knowledge.
            Mindmaps, summaries, and chat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/50 transition-all shadow-xl">
            <Search className="w-6 h-6 ml-4 text-slate-500" />
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              className="w-full bg-transparent p-4 text-white placeholder:text-slate-600 focus:outline-none"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
            />
            <button
              type="submit"
              disabled={!url}
              className="m-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Analyze <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <div className="absolute top-full left-0 mt-2 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
        </form>

        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            Transcript
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            Summary
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            Mindmap
          </span>
        </div>
      </div>
    </div>
  )
}

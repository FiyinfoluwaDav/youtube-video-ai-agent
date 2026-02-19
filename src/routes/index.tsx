import { assets } from '@/components/chatbot UI/assets/assets'
import { extractVideoId } from '@/lib/utils'
import { useClerk, useUser } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { isSignedIn, isLoaded } = useUser()
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-white">
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        {isLoaded && isSignedIn ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign Out
          </button>
        ) : isLoaded && !isSignedIn ? (
          <>
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign up
            </a>
          </>
        ) : (
          // Loading state (invisible or skeleton)
          <div className="w-20 h-8"></div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white dark:bg-white/5 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 shadow-xl">
            <img src={assets.logo} alt="Summara Logo" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white">
            YouTube AI Agent
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">
            Transform video content into interactive knowledge. Mindmaps,
            summaries, and chat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full relative group">
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-slate-500 transition-all shadow-lg">
            <Search className="w-6 h-6 ml-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              className="w-full bg-transparent p-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
            />
            <button
              type="submit"
              disabled={!url}
              className="m-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Analyze <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <div className="absolute top-full left-0 mt-2 text-red-500 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
        </form>

        <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-500">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Transcript
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Summary
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            Mindmap
          </span>
        </div>
      </div>
    </div>
  )
}

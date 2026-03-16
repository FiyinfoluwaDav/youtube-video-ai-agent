import '@/components/chatbot UI/assets/prism.css'
import ChatBot from '@/components/chatbot UI/components/ChatBot'
import Sidebar from '@/components/chatbot UI/components/Sidebar'
import { useAppContext } from '@/components/chatbot UI/context/AppContext'
import Loading from '@/components/chatbot UI/pages/Loading'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import {
  AlertCircle,
  ChevronsRight,
  FileText,
  Search,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels'
import YouTube, { YouTubeProps } from 'react-youtube'

export const Route = createFileRoute('/video/$videoId')({
  component: VideoPage,
})

function VideoPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { setSelectedChat } = useAppContext()
  const [newVideoUrl, setNewVideoUrl] = useState('')

  const handleNewVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVideoUrl.trim()) return

    const match = newVideoUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    )
    if (match && match[1]) {
      const newId = match[1]
      setSelectedChat(null)
      navigate({ to: '/video/$videoId', params: { videoId: newId } })
      setNewVideoUrl('')
    } else {
      alert('Please enter a valid YouTube URL.')
    }
  }

  if (pathname === '/loading') return <Loading />
  const { videoId } = Route.useParams()
  const trpc = useTRPC()
  const {
    data: transcript,
    isLoading,
    error,
  } = useQuery({
    ...trpc.youtube.getTranscript.queryOptions({ videoId }),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const playerRef = useRef<any>(null)
  const activeTranscriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime()
        setCurrentTime(time)
      }, 500) // Update every 500ms
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  useEffect(() => {
    if (activeTranscriptRef.current) {
      activeTranscriptRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentTime])

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target
    if (event.target.getVideoData) {
      setVideoTitle(event.target.getVideoData().title || '')
    }
  }

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = playing, 2 = paused
    setIsPlaying(event.data === 1)
  }

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  }

  // Calculate active transcript index
  // Find the last item where item.offset <= currentTime
  const activeIndex = transcript?.reduce((acc, item, index) => {
    if (item.offset <= currentTime) {
      return index
    }
    return acc
  }, -1)

  const handleTranscriptClick = (offset: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(offset, true)
      playerRef.current.playVideo()
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (error || !transcript) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-red-200 flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-center font-medium">Failed to load transcript</p>
          <p className="text-sm opacity-80 text-center">
            {error?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobile && isMenuOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar (Floating) */}
        {isMobile && (
          <div
            className={`absolute top-0 left-0 h-full z-50 w-72 bg-white dark:bg-[#0a0a0a] border-r border-gray-300 dark:border-white/10 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
              !isMenuOpen ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <Sidebar
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              videoId={videoId}
              toggleSidebar={toggleSidebar}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </div>
        )}

        {!isMenuOpen && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="absolute top-5 left-5 z-40 md:hidden p-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-sm"
          >
            <ChevronsRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}

        {/* New Video Input Field */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 md:top-4 md:left-auto md:translate-x-0 md:right-4 z-40 md:z-50 w-[calc(100%-9rem)] md:w-auto transition-all duration-300">
          <form onSubmit={handleNewVideoSubmit}>
            <div className="flex items-center bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] border border-gray-200/60 dark:border-white/10 px-4 py-2.5 hover:shadow-lg transition-all duration-300 w-full md:w-[320px] lg:w-[400px] focus-within:md:w-[400px] focus-within:lg:w-[480px]">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2.5 shrink-0" />
              <input
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="Paste new YouTube link..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 w-full"
              />
            </div>
          </form>
        </div>

        <PanelGroup orientation="horizontal">
          {/* Left Panel: Sidebar (Resizable - Desktop Only) */}
          {!isMobile && !isSidebarCollapsed && (
            <>
              <Panel
                defaultSize={20}
                minSize={15}
                className="flex flex-col h-full overflow-hidden border-r border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] transition-all duration-300 ease-in-out relative"
              >
                <Sidebar
                  isMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                  videoId={videoId}
                  toggleSidebar={toggleSidebar}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              </Panel>
              <PanelResizeHandle className="w-1.5 bg-gray-300 dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/5 hover:bg-gray-400 dark:hover:bg-white/20 transition-colors cursor-col-resize active:bg-gray-500 dark:active:bg-white/30 hidden md:block" />
            </>
          )}

          {/* Middle Panel: Chat Interface */}
          <Panel
            defaultSize={isSidebarCollapsed ? 65 : 45}
            minSize={30}
            className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0a0a0a] transition-all duration-300 ease-in-out relative flex-1"
          >
            {/* ChatBot always rendered, takes available space */}
            <ChatBot
              transcript={transcript}
              currentTime={currentTime}
              videoId={videoId}
              videoTitle={videoTitle}
            />
          </Panel>

          {!isMobile && (
            <PanelResizeHandle
              className={`w-1.5 bg-gray-300 dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/5 hover:bg-gray-400 dark:hover:bg-white/20 transition-colors cursor-col-resize active:bg-gray-500 dark:active:bg-white/30 hidden md:block`}
            />
          )}

          {/* Expand Button when Sidebar is Collapsed */}
          {isSidebarCollapsed && (
            <div className="absolute top-4 left-4 z-50 hidden md:block">
              <button
                onClick={toggleSidebar}
                className="p-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                title="Expand Sidebar"
              >
                <ChevronsRight className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
              </button>
            </div>
          )}

          {!isMobile && (
            <>
              <PanelResizeHandle
                className={`w-1.5 bg-gray-300 dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/5 hover:bg-gray-400 dark:hover:bg-white/20 transition-colors cursor-col-resize active:bg-gray-500 dark:active:bg-white/30 hidden md:block`}
              />

              {/* Right Panel: Video & Transcript (Default 35%) */}
              <Panel
                defaultSize={35}
                minSize={20}
                collapsible={true}
                collapsedSize={0}
                className="hidden md:flex"
              >
                <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a] w-full">
                  {/* Video Section */}
                  <div className="w-full bg-black shadow-xl shrink-0">
                    <div className="aspect-video w-full">
                      <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        className="w-full h-full"
                        iframeClassName="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Transcript Section */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-300 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                      <h2 className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        Transcript
                      </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                      {transcript.map((item, index) => {
                        const isActive = index === activeIndex
                        return (
                          <div
                            key={index}
                            ref={isActive ? activeTranscriptRef : null}
                            onClick={() => handleTranscriptClick(item.offset)}
                            className={`group p-2.5 rounded-lg transition-all cursor-pointer text-sm leading-relaxed ${
                              isActive
                                ? 'bg-gray-200 dark:bg-[#202020] text-black dark:text-white font-medium'
                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex gap-2 items-start">
                              <span
                                className={`text-xs font-mono mt-0.5 select-none transition-opacity min-w-[35px] ${
                                  isActive
                                    ? 'opacity-100 text-gray-600 dark:text-gray-400'
                                    : 'opacity-0 group-hover:opacity-100 text-slate-500'
                                }`}
                              >
                                {Math.floor(item.offset / 60)}:
                                {String(Math.floor(item.offset % 60)).padStart(
                                  2,
                                  '0',
                                )}
                              </span>
                              <p>{item.text}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </>
  )
}

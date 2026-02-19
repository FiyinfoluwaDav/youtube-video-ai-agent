import { assets } from '@/components/chatbot UI/assets/assets'
import '@/components/chatbot UI/assets/prism.css'
import ChatBot from '@/components/chatbot UI/components/ChatBot'
import Sidebar from '@/components/chatbot UI/components/Sidebar'
import Loading from '@/components/chatbot UI/pages/Loading'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLocation } from '@tanstack/react-router'
import { AlertCircle, ChevronsRight, FileText, Loader2 } from 'lucide-react'
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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }
  const { pathname } = useLocation()

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
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
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
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          alt=""
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden invert dark:invert-0"
          onClick={() => setIsMenuOpen(true)}
        />
      )}
      <div className="h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
        <PanelGroup orientation="horizontal">
          {/* Left Panel: Sidebar & Chat Interface (Default 65%) */}
          <Panel
            defaultSize={65}
            minSize={30}
            className={`flex flex-row border-r border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] transition-all duration-300 ease-in-out relative`}
          >
            {!isSidebarCollapsed && (
              <Sidebar
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                videoId={videoId}
                toggleSidebar={toggleSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
              />
            )}

            {/* ChatBot always rendered, takes available space */}
            <ChatBot
              transcript={transcript}
              currentTime={currentTime}
              videoId={videoId}
            />
          </Panel>

          <PanelResizeHandle
            className={`w-1.5 bg-gray-300 dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/5 hover:bg-gray-400 dark:hover:bg-white/20 transition-colors cursor-col-resize active:bg-gray-500 dark:active:bg-white/30`}
          />

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

          {/* Right Panel: Video & Transcript (Default 35%) */}
          <Panel
            defaultSize={35}
            minSize={20}
            collapsible={true}
            collapsedSize={0}
          >
            <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
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
        </PanelGroup>
      </div>
    </>
  )
}

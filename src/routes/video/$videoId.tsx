import ChatBot from '@/components/chatbot UI/components/ChatBot'
import Sidebar from '@/components/chatbot UI/components/Sidebar'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, FileText, Loader2 } from 'lucide-react'
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels'

export const Route = createFileRoute('/video/$videoId')({
  component: VideoPage,
})

function VideoPage() {
  const { videoId } = Route.useParams()
  const trpc = useTRPC()
  const {
    data: transcript,
    isLoading,
    error,
  } = useQuery(trpc.youtube.getTranscript.queryOptions({ videoId }))

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
    <div className="h-screen bg-slate-950 text-white overflow-hidden">
      <PanelGroup orientation="horizontal">
        {/* Left Panel: Sidebar & Chat Interface (Default 65%) */}
        <Panel
          defaultSize={65}
          minSize={30}
          className="flex flex-row border-r border-white/10 bg-slate-950"
        >
          <Sidebar />
          <ChatBot />
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-slate-900 hover:bg-purple-500/50 transition-colors cursor-col-resize active:bg-purple-500" />

        {/* Right Panel: Video & Transcript (Default 35%) */}
        <Panel
          defaultSize={35}
          minSize={20}
          collapsible={true}
          collapsedSize={0}
        >
          <div className="h-full flex flex-col bg-slate-900">
            {/* Video Section */}
            <div className="w-full bg-black shadow-xl shrink-0">
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Transcript Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between sticky top-0">
                <h2 className="font-semibold flex items-center gap-2 text-slate-200 text-sm">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Transcript
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {transcript.map((item, index) => (
                  <div
                    key={index}
                    className="group p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-slate-300 text-sm leading-relaxed"
                  >
                    <div className="flex gap-2 items-start">
                      <span className="text-xs text-slate-500 font-mono mt-0.5 select-none opacity-0 group-hover:opacity-100 transition-opacity min-w-[35px]">
                        {Math.floor(item.offset / 60)}:
                        {String(Math.floor(item.offset % 60)).padStart(2, '0')}
                      </span>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

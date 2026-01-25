import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, FileText, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/video/$videoId')({
  component: VideoPage,
})

function VideoPage() {
  const { videoId } = Route.useParams()
  const trpc = useTRPC()
  const { data: transcript, isLoading, error } = useQuery(
    trpc.youtube.getTranscript.queryOptions({ videoId })
  )

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
          <p className="text-sm opacity-80 text-center">{error?.message || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar / Transcript Area */}
      <div className="w-full max-w-md border-r border-white/10 bg-slate-900 overflow-hidden flex flex-col h-screen">
        <div className="p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="font-semibold flex items-center gap-2 text-slate-200">
            <FileText className="w-4 h-4 text-purple-400" />
            Transcript
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {transcript.map((item, index) => (
            <div 
              key={index} 
              className="group p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-slate-300 text-sm leading-relaxed"
            >
              <div className="flex gap-2 items-start">
                <span className="text-xs text-slate-600 font-mono mt-0.5 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.floor(item.offset / 60)}:{String(Math.floor(item.offset % 60)).padStart(2, '0')}
                </span>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area (Video & Mindmap placeholder for now) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl mb-6 ring-1 ring-white/10">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 rounded-xl bg-slate-900/50 border border-white/10 p-6 flex flex-col items-center justify-center text-slate-500 hover:border-purple-500/30 transition-colors group">
            <span className="mb-2 group-hover:text-purple-400 transition-colors">Mindmap (Coming Soon)</span>
          </div>
           <div className="h-64 rounded-xl bg-slate-900/50 border border-white/10 p-6 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/30 transition-colors group">
            <span className="mb-2 group-hover:text-cyan-400 transition-colors">Summary (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

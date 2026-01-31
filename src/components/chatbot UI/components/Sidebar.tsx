import { History, MessageSquarePlus, Settings } from 'lucide-react'

const Sidebar = () => {
  return (
    <div className="w-16 lg:w-64 h-full bg-slate-900 border-r border-white/10 flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="p-4 flex items-center justify-center lg:justify-start gap-3 border-b border-white/10 h-16">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <MessageSquarePlus className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-slate-200 hidden lg:block truncate">
          New Chat
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
        <div className="px-2 pb-2 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:block">
          History
        </div>
        {/* Placeholder for history items */}
        {[1, 2, 3].map((i) => (
          <button
            key={i}
            className="w-full p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 flex items-center gap-3 transition-colors group"
          >
            <History className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm truncate hidden lg:block">
              Previous Chat {i}
            </span>
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-white/10">
        <button className="w-full p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 flex items-center gap-3 transition-colors justify-center lg:justify-start">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium hidden lg:block">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

import { Music, Search, Settings, List, SkipBack, Play, SkipForward } from 'lucide-react'

const songs = ['Midnight Run', 'Ocean Drive', 'Neon Pulse', 'Daydream', 'Starlight', 'Velocity', 'Aurora', 'Eclipse']
const gradients = [
  'from-pink-500 to-purple-500',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-red-500',
  'from-emerald-500 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-emerald-500',
  'from-red-500 to-amber-500',
  'from-indigo-500 to-purple-500',
]

export default function MusicPlayerDemo() {
  return (
    <div className="absolute inset-0 flex bg-gradient-to-br from-[#0c0618] via-[#0a0f1e] to-[#0f0a1e]">
      {/* Sidebar */}
      <div className="w-[52px] bg-black/30 border-r border-white/[0.04] flex flex-col items-center py-3 gap-3.5">
        {[Music, List, Search, Settings].map((Icon, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              i === 0 ? 'bg-purple-500/30' : 'bg-white/[0.06]'
            }`}
          >
            <Icon size={12} className={i === 0 ? 'text-purple-400' : 'text-white/40'} strokeWidth={2} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex justify-between items-center">
          <span className="text-[11px] font-semibold text-text-secondary">Library</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
            <Search size={8} className="text-text-dim" />
            <span className="text-[10px] text-text-dim">Search...</span>
          </div>
        </div>

        {/* Song grid */}
        <div className="flex-1 grid grid-cols-4 gap-2 px-4 pb-2 overflow-hidden">
          {songs.map((name, i) => (
            <div
              key={name}
              className={`rounded-lg relative overflow-hidden border border-white/[0.04] bg-gradient-to-br ${gradients[i]}`}
            >
              <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-gradient-to-t from-black/70">
                <span className="text-[8px] text-white/80 font-medium">{name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visualizer */}
        <div className="absolute bottom-[58px] right-4 flex gap-[2px] items-end h-6">
          {[8, 16, 22, 12, 18, 10].map((h, i) => (
            <span
              key={i}
              className="w-[2px] rounded-sm bg-gradient-to-t from-purple-500 to-cyan-400"
              style={{
                height: `${h}px`,
                animation: `vizBar 1s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-r-sm"
            style={{ width: '35%', animation: 'progressMove 12s linear infinite' }}
          />
        </div>

        {/* Player bar */}
        <div className="h-14 bg-black/40 border-t border-white/[0.04] backdrop-blur-xl flex items-center px-4 gap-3">
          {/* Playing cover / vinyl */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 shrink-0 relative overflow-hidden">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, #333 0%, #111 25%, #222 26%, #0a0a0a 50%, #1a1a1a 51%, #111 100%)',
                animation: 'spin 3s linear infinite',
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-text-primary truncate">Midnight Run - Synthwave Mix</div>
            <div className="text-[9px] text-text-dim">Various Artists</div>
          </div>
          <div className="flex items-center gap-2">
            <SkipBack size={10} className="text-text-secondary" />
            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
              <Play size={12} className="text-white ml-0.5" fill="white" />
            </div>
            <SkipForward size={10} className="text-text-secondary" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vizBar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.25)} }
        @keyframes progressMove { 0%{width:35%} 100%{width:100%} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

import { User } from 'lucide-react'

const communityCards = [
  { rank: 'A', suit: '\u2665', color: 'text-red-500' },
  { rank: 'K', suit: '\u2660', color: 'text-slate-800' },
  { rank: 'Q', suit: '\u2666', color: 'text-red-500' },
  { rank: 'J', suit: '\u2663', color: 'text-slate-800' },
  { rank: '10', suit: '\u2665', color: 'text-red-500' },
]

const players = [
  { name: 'Player 1', chips: '$1,800', pos: 'top-[8%] left-1/2 -translate-x-1/2' },
  { name: 'Player 2', chips: '$2,200', pos: 'top-[20%] right-[8%]', dealer: true },
  { name: 'NPC', chips: '$960', pos: 'bottom-[20%] right-[8%]' },
  { name: 'You', chips: '$1,540', pos: 'bottom-[5%] left-1/2 -translate-x-1/2' },
  { name: 'Player 4', chips: '$1,100', pos: 'bottom-[20%] left-[8%]' },
  { name: 'Player 5', chips: '$2,000', pos: 'top-[20%] left-[8%]' },
]

export default function PokerDemo() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#061a0e] via-[#081018] to-[#0a0a14] flex items-center justify-center">
      {/* Felt table */}
      <div className="w-[80%] h-[70%] rounded-[50%] relative flex items-center justify-center bg-[radial-gradient(ellipse,#1a5c2a_0%,#0e4520_40%,#0a3018_70%,#061a0e_100%)] border-[3px] border-[#2a1a0a] shadow-[0_0_60px_rgba(26,92,42,0.2),inset_0_0_40px_rgba(0,0,0,0.4)]">
        {/* Community cards */}
        <div className="flex gap-1">
          {communityCards.map((card, i) => (
            <div
              key={i}
              className="w-7 h-10 rounded bg-gradient-to-br from-white to-gray-100 shadow-md flex flex-col items-center justify-center leading-none opacity-0"
              style={{ animation: `cardDeal 0.5s ease ${0.2 + i * 0.15}s forwards` }}
            >
              <span className={`text-[9px] font-bold ${card.color}`}>{card.rank}</span>
              <span className={`text-[11px] ${card.color}`}>{card.suit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pot */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/15">
        POT $240
      </div>

      {/* Player seats */}
      {players.map((p, i) => (
        <div key={i} className={`absolute flex flex-col items-center gap-0.5 ${p.pos}`}>
          <div className={`w-7 h-7 rounded-full bg-white/[0.08] border-2 flex items-center justify-center ${
            p.dealer ? 'border-amber-400' : 'border-white/[0.12]'
          }`}>
            <User size={12} className="text-white/40" />
          </div>
          <span className="text-[8px] text-text-dim font-medium">{p.name}</span>
          <span className="text-[8px] text-amber-400 font-semibold font-mono">{p.chips}</span>
        </div>
      ))}

      {/* Chip stacks */}
      <div className="absolute bottom-[42%] right-[30%] flex flex-col-reverse">
        {['bg-red-500', 'bg-red-500', 'bg-blue-500'].map((c, i) => (
          <div key={i} className={`w-3.5 h-1 rounded-full ${c} shadow-sm`} style={{ marginTop: i > 0 ? '-2px' : 0 }} />
        ))}
      </div>
      <div className="absolute bottom-[42%] left-[30%] flex flex-col-reverse">
        {['bg-amber-400', 'bg-amber-400'].map((c, i) => (
          <div key={i} className={`w-3.5 h-1 rounded-full ${c} shadow-sm`} style={{ marginTop: i > 0 ? '-2px' : 0 }} />
        ))}
      </div>

      <style>{`
        @keyframes cardDeal {
          from { opacity:0; transform: translateY(-20px) scale(0.6) rotateY(90deg); }
          to { opacity:1; transform: translateY(0) scale(1) rotateY(0); }
        }
      `}</style>
    </div>
  )
}

import { useEffect, useRef } from 'react'

export default function StarshipDemo() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const c = canvasRef.current
    const container = containerRef.current
    if (!c || !container) return
    const ctx = c.getContext('2d')
    const stars = []
    let animId

    function resize() {
      c.width = container.clientWidth
      c.height = container.clientHeight
      stars.length = 0
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          r: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    let t = 0
    function draw() {
      t += 0.016
      ctx.clearRect(0, 0, c.width, c.height)
      stars.forEach(s => {
        const alpha = 0.15 + 0.35 * (Math.sin(t * s.speed * 60 + s.phase) + 1) / 2
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Ship image */}
      <img
        src="assets/starship.png"
        alt="Starship Odyssey"
        className="relative z-10 w-[60%] h-auto drop-shadow-[0_0_40px_rgba(100,150,255,0.25)] transition-transform duration-600 hover:scale-105 hover:-translate-y-1"
      />

      {/* HUD overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none p-4">
        <div className="flex justify-between">
          <HudBadge>LEVEL 04</HudBadge>
          <HudBadge>SUPPLIES 2/5</HudBadge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <HudBadge className="mb-1.5">ENERGY</HudBadge>
            <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            </div>
          </div>
          <span className="font-mono text-[10px] text-amber-400/60">SCORE 2,450</span>
        </div>
      </div>
    </div>
  )
}

function HudBadge({ children, className = '' }) {
  return (
    <span className={`font-mono text-[10px] text-cyan-400/60 px-2 py-1 rounded bg-cyan-400/[0.06] border border-cyan-400/10 ${className}`}>
      {children}
    </span>
  )
}

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const [hovering, setHovering] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const smoothPos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const hoverSelector = 'a,button,[role="button"],.hoverable'

    const onOver = (e) => {
      if (e.target.closest(hoverSelector)) setHovering(true)
    }
    const onOut = (e) => {
      if (e.target.closest(hoverSelector)) setHovering(false)
    }

    let animId
    function animate() {
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.15
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.15
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${smoothPos.current.x}px, ${smoothPos.current.y}px)`
      }
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
    >
      <div
        className={`absolute rounded-full bg-white transition-transform duration-100 ${
          hovering ? 'w-3 h-3 -top-1.5 -left-1.5 scale-150' : 'w-2 h-2 -top-1 -left-1'
        }`}
      />
      <div
        className={`absolute rounded-full border transition-all duration-300 ${
          hovering
            ? 'w-16 h-16 -top-8 -left-8 border-cyan-400'
            : 'w-10 h-10 -top-5 -left-5 border-white/50'
        }`}
        style={{ borderWidth: '1.5px' }}
      />
    </div>
  )
}

import { useEffect, useRef } from 'react'

export default function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    let w, h, animId
    const particles = []
    const N = 55
    const mouse = { x: -1000, y: -1000 }

    function resize() {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
    }

    class Particle {
      constructor() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.vx = (Math.random() - 0.5) * 0.2
        this.vy = (Math.random() - 0.5) * 0.2
        this.r = Math.random() * 1.2 + 0.3
        this.a = Math.random() * 0.2 + 0.05
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > w) this.vx *= -1
        if (this.y < 0 || this.y > h) this.vy *= -1
      }
    }

    function init() {
      resize()
      particles.length = 0
      for (let i = 0; i < N; i++) particles.push(new Particle())
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < N; i++) {
        const p = particles[i]
        p.update()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.a})`
        ctx.fill()

        for (let j = i + 1; j < N; j++) {
          const q = particles[j]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = dx * dx + dy * dy
          if (d < 16000) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(255,255,255,${0.035 * (1 - d / 16000)})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        }

        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 180) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = `rgba(34,211,238,${0.08 * (1 - d / 180)})`
          ctx.lineWidth = 0.4
          ctx.stroke()
        }
      }
      animId = requestAnimationFrame(draw)
    }

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    init()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}

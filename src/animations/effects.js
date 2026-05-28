// Canvas effects — 重返未来1999 gold-tinted particles
// 40 particles (cleaner), gold-tinted rgba(200, 168, 78, alpha),
// occasional larger "mote" particles that glow, warmer gold light streaks,
// smoother mouse repulsion, occasional opacity pulse.

export function initCanvas() {
  const canvas = document.getElementById('ambientCanvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let width = 0
  let height = 0
  let particles = []
  let motes = []
  let streaks = []
  let mouse = { x: -1000, y: -1000 }
  let smoothMouse = { x: -1000, y: -1000 }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.width = Math.floor(window.innerWidth * ratio)
    height = canvas.height = Math.floor(window.innerHeight * ratio)
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    initParticles()
  }

  function initParticles() {
    // Regular dust particles — gold-tinted
    particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      speed: 0.12 + Math.random() * 0.35,
      depth: 0.3 + Math.random() * 0.7,
      opacity: 0.06 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      // Pulse properties
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5,
      pulseAmount: 0.3 + Math.random() * 0.5, // How much opacity oscillates
    }))

    // Occasional larger "mote" particles that glow
    motes = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 4 + Math.random() * 6,
      speed: 0.05 + Math.random() * 0.15,
      depth: 0.6 + Math.random() * 0.4,
      opacity: 0.08 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
      glowPhase: Math.random() * Math.PI * 2,
      glowSpeed: 0.3 + Math.random() * 0.8,
    }))

    // Light streaks — warmer gold
    streaks = Array.from({ length: 4 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 80 + Math.random() * 180,
      angle: Math.random() * Math.PI,
      speed: 0.2 + Math.random() * 0.4,
      opacity: 0.015 + Math.random() * 0.03,
      life: Math.random(),
    }))
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height)
    const t = time / 1000

    // Smooth mouse tracking (lerp for smoother repulsion)
    const lerpFactor = 0.08
    smoothMouse.x += (mouse.x - smoothMouse.x) * lerpFactor
    smoothMouse.y += (mouse.y - smoothMouse.y) * lerpFactor

    const isLight = document.documentElement.dataset.theme === 'light'
    const goldR = isLight ? 139 : 200
    const goldG = isLight ? 105 : 168
    const goldB = isLight ? 20 : 78

    // ── Draw regular particles ──
    particles.forEach((p) => {
      if (!reduced.matches) {
        p.y -= p.speed * p.depth * 0.8
        p.x += Math.sin(t * 0.5 + p.phase) * 0.3 * p.depth

        // Smoother mouse repulsion
        const dx = p.x - smoothMouse.x * (window.devicePixelRatio || 1)
        const dy = p.y - smoothMouse.y * (window.devicePixelRatio || 1)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repulseRadius = 100
        if (dist < repulseRadius) {
          const force = ((repulseRadius - dist) / repulseRadius) * 0.8
          p.x += (dx / dist) * force * 1.5
          p.y += (dy / dist) * force * 1.5
        }

        // Wrap
        if (p.y < -10) p.y = height + 10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
      }

      // Opacity pulse
      const pulse = Math.sin(t * p.pulseSpeed + p.pulsePhase) * p.pulseAmount
      const alpha = Math.max(0.02, (p.opacity + pulse * p.opacity) * p.depth)

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.depth, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${goldR}, ${goldG}, ${goldB}, ${alpha})`
      ctx.fill()
    })

    // ── Draw mote particles (larger, glowing) ──
    motes.forEach((m) => {
      if (!reduced.matches) {
        m.y -= m.speed * m.depth * 0.6
        m.x += Math.sin(t * 0.3 + m.phase) * 0.2 * m.depth

        // Smoother mouse repulsion for motes
        const dx = m.x - smoothMouse.x * (window.devicePixelRatio || 1)
        const dy = m.y - smoothMouse.y * (window.devicePixelRatio || 1)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repulseRadius = 150
        if (dist < repulseRadius) {
          const force = ((repulseRadius - dist) / repulseRadius) * 0.5
          m.x += (dx / dist) * force * 1.2
          m.y += (dy / dist) * force * 1.2
        }

        // Wrap
        if (m.y < -20) m.y = height + 20
        if (m.x < -20) m.x = width + 20
        if (m.x > width + 20) m.x = -20
      }

      // Glow oscillation
      const glow = Math.sin(t * m.glowSpeed + m.glowPhase) * 0.5 + 0.5
      const alpha = m.opacity * m.depth * (0.6 + glow * 0.4)

      // Outer glow
      const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * m.depth * 3)
      gradient.addColorStop(0, `rgba(${goldR}, ${goldG}, ${goldB}, ${alpha * 0.6})`)
      gradient.addColorStop(0.4, `rgba(${goldR}, ${goldG}, ${goldB}, ${alpha * 0.2})`)
      gradient.addColorStop(1, `rgba(${goldR}, ${goldG}, ${goldB}, 0)`)
      ctx.beginPath()
      ctx.arc(m.x, m.y, m.size * m.depth * 3, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(m.x, m.y, m.size * m.depth, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${goldR}, ${goldG}, ${goldB}, ${alpha})`
      ctx.fill()
    })

    // ── Draw light streaks — warmer gold ──
    streaks.forEach((s) => {
      if (!reduced.matches) {
        s.life += 0.003
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed

        if (s.life > 1 || s.x < -200 || s.x > width + 200 || s.y < -200 || s.y > height + 200) {
          s.x = Math.random() * width
          s.y = Math.random() * height
          s.angle = Math.random() * Math.PI
          s.life = 0
        }
      }

      const fadeIn = Math.min(s.life * 5, 1)
      const fadeOut = Math.max(1 - (s.life - 0.7) * 3.33, 0)
      const alpha = s.opacity * fadeIn * fadeOut

      if (alpha > 0.001) {
        const endX = s.x + Math.cos(s.angle) * s.length
        const endY = s.y + Math.sin(s.angle) * s.length

        const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY)
        // Warmer gold for streaks
        const streakR = isLight ? 42 : 212
        const streakG = isLight ? 36 : 168
        const streakB = isLight ? 32 : 67
        gradient.addColorStop(0, `rgba(${streakR}, ${streakG}, ${streakB}, 0)`)
        gradient.addColorStop(0.5, `rgba(${streakR}, ${streakG}, ${streakB}, ${alpha})`)
        gradient.addColorStop(1, `rgba(${streakR}, ${streakG}, ${streakB}, 0)`)

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    if (!reduced.matches) requestAnimationFrame(draw)
  }

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  }, { passive: true })

  resize()
  draw()
  window.addEventListener('resize', resize)
}

// Magnetic hover — tracks mouse position on cards for radial glow effect
export function initMagneticHover() {
  const cards = document.querySelectorAll('.showcase-card, .desk-card, .note-card')

  cards.forEach((card) => {
    card.style.position = 'relative'
    card.style.overflow = 'hidden'

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mouse-x', `${x}%`)
      card.style.setProperty('--mouse-y', `${y}%`)
    })
  })
}

// Canvas effects — floating dust particles with depth and light streaks
export function initCanvas() {
  const canvas = document.getElementById('ambientCanvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let width = 0
  let height = 0
  let particles = []
  let streaks = []
  let mouse = { x: -1000, y: -1000 }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.width = Math.floor(window.innerWidth * ratio)
    height = canvas.height = Math.floor(window.innerHeight * ratio)
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    initParticles()
  }

  function initParticles() {
    // Dust particles at different depths
    particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.5,
      speed: 0.15 + Math.random() * 0.4,
      depth: 0.3 + Math.random() * 0.7, // 0.3 = far, 1.0 = near
      opacity: 0.08 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    }))

    // Light streaks
    streaks = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 80 + Math.random() * 200,
      angle: Math.random() * Math.PI,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.02 + Math.random() * 0.04,
      life: Math.random(),
    }))
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height)
    const t = time / 1000

    // Get accent color
    const style = getComputedStyle(document.documentElement)
    const isLight = document.documentElement.dataset.theme === 'light'

    // Draw particles
    particles.forEach((p) => {
      if (!reduced.matches) {
        p.y -= p.speed * p.depth * 0.8
        p.x += Math.sin(t * 0.5 + p.phase) * 0.3 * p.depth

        // Mouse repulsion
        const dx = p.x - mouse.x * (window.devicePixelRatio || 1)
        const dy = p.y - mouse.y * (window.devicePixelRatio || 1)
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          p.x += (dx / dist) * force * 2
          p.y += (dy / dist) * force * 2
        }

        // Wrap
        if (p.y < -10) p.y = height + 10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
      }

      const alpha = p.opacity * p.depth
      const color = isLight ? `rgba(26, 23, 20, ${alpha})` : `rgba(232, 224, 212, ${alpha})`

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.depth, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })

    // Draw light streaks
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
        const streakColor = isLight ? '26, 23, 20' : '201, 168, 76'
        gradient.addColorStop(0, `rgba(${streakColor}, 0)`)
        gradient.addColorStop(0.5, `rgba(${streakColor}, ${alpha})`)
        gradient.addColorStop(1, `rgba(${streakColor}, 0)`)

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

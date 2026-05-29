// Reactive dot-grid field — a faint "infinite canvas" backdrop that brightens
// toward the cursor. Redraws on demand (mouse / resize / theme), not every frame.
export function initDotField() {
  const canvas = document.getElementById('dotfield')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(pointer: fine)').matches

  const GAP = 40
  const RADIUS = 150
  let dpr = 1
  let dots = []
  const mouse = { x: -9999, y: -9999 }
  let raf = null

  const accent = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#C8FF3D'
  const isLight = () => document.documentElement.dataset.theme === 'light'

  const build = () => {
    dots = []
    const cols = Math.ceil(window.innerWidth / GAP) + 1
    const rows = Math.ceil(window.innerHeight / GAP) + 1
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) dots.push({ x: c * GAP, y: r * GAP })
    }
  }

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    build()
    draw()
  }

  const draw = () => {
    raf = null
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    const baseAlpha = isLight() ? 0.14 : 0.07
    const baseRGB = isLight() ? '10,10,11' : '255,255,255'
    const acc = accent()
    for (const d of dots) {
      const dx = d.x - mouse.x
      const dy = d.y - mouse.y
      const dist = Math.hypot(dx, dy)
      let size = 1.1
      if (dist < RADIUS) {
        const t = 1 - dist / RADIUS
        size = 1.1 + t * 2.4
        ctx.fillStyle = acc
        ctx.globalAlpha = 0.18 + t * 0.6
      } else {
        ctx.fillStyle = `rgba(${baseRGB}, ${baseAlpha})`
        ctx.globalAlpha = 1
      }
      ctx.beginPath()
      ctx.arc(d.x, d.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const request = () => { if (!raf) raf = requestAnimationFrame(draw) }

  resize()
  window.addEventListener('resize', resize)
  document.getElementById('themeToggle')?.addEventListener('click', () => setTimeout(draw, 60))

  if (fine && !reduced) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      request()
    }, { passive: true })
    window.addEventListener('mouseleave', () => {
      mouse.x = mouse.y = -9999
      request()
    })
  }
}

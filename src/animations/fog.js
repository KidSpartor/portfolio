// Hero glass — cinematic condensation without pointer-wipe gimmicks.
// The copy stays inside the room; this layer sits on the window between copy
// and background. It adds a stable misted pane, rare slow rivulets, and a weak
// mouse-driven specular sheen. No clearing/erasing interaction.

export function initFog() {
  const canvas = document.getElementById('heroFog')
  const frost = document.getElementById('heroFrost')
  const hero = document.querySelector('.scene-hero')
  if (!canvas || !hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    canvas.style.display = 'none'
    if (frost) frost.style.display = 'none'
    return
  }

  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let W = 0
  let H = 0
  let cssW = 0
  let cssH = 0
  let baseMist = null
  let rivulets = []
  let mouse = { x: -9999, y: -9999 }
  let heroRect = hero.getBoundingClientRect()
  let raf = 0
  let running = false

  function tint() {
    const dark = document.documentElement.dataset.theme === 'dark'
    return dark
      ? { r: 184, g: 198, b: 214, a: 0.34 }
      : { r: 236, g: 229, b: 218, a: 0.3 }
  }

  function makeBaseMist() {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const x = c.getContext('2d')
    const { r, g, b, a } = tint()

    const wash = x.createLinearGradient(0, 0, 0, H)
    wash.addColorStop(0, `rgba(${r},${g},${b},${a + 0.1})`)
    wash.addColorStop(0.48, `rgba(${r},${g},${b},${a})`)
    wash.addColorStop(1, `rgba(${r},${g},${b},${a + 0.04})`)
    x.fillStyle = wash
    x.fillRect(0, 0, W, H)

    const area = cssW * cssH
    const softPatches = Math.max(8, Math.round(area / 90000))
    for (let i = 0; i < softPatches; i++) {
      const cx = Math.random() * W
      const cy = Math.random() * H
      const rad = (150 + Math.random() * 280) * dpr
      const g1 = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
      const lift = Math.random() < 0.5 ? 1 : -1
      if (lift > 0) {
        g1.addColorStop(0, `rgba(${r},${g},${b},${0.05 + Math.random() * 0.06})`)
        g1.addColorStop(1, `rgba(${r},${g},${b},0)`)
      } else {
        g1.addColorStop(0, `rgba(${Math.max(0, r - 34)},${Math.max(0, g - 26)},${Math.max(0, b - 18)},0.035)`)
        g1.addColorStop(1, `rgba(${r},${g},${b},0)`)
      }
      x.globalCompositeOperation = 'source-over'
      x.fillStyle = g1
      x.beginPath()
      x.arc(cx, cy, rad, 0, Math.PI * 2)
      x.fill()
    }
    x.globalCompositeOperation = 'source-over'

    // Fine bead texture. Low alpha, no animation, so it reads as glass material.
    const beads = Math.round(area / 2600)
    for (let i = 0; i < beads; i++) {
      const bx = Math.random() * W
      const by = Math.random() * H
      const br = (0.35 + Math.random() * 0.9) * dpr
      x.fillStyle = `rgba(255,255,255,${0.025 + Math.random() * 0.045})`
      x.beginPath()
      x.arc(bx, by, br, 0, Math.PI * 2)
      x.fill()
    }

    // Edge density keeps the pane cinematic without hiding the typography.
    const edge = x.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.22, W / 2, H * 0.45, Math.max(W, H) * 0.7)
    edge.addColorStop(0, 'rgba(0,0,0,0)')
    edge.addColorStop(1, `rgba(${r},${g},${b},0.16)`)
    x.fillStyle = edge
    x.fillRect(0, 0, W, H)

    return c
  }

  function seedRivulets() {
    const count = cssW < 700 ? 2 : 4
    rivulets = Array.from({ length: count }, () => ({
      x: Math.random() * cssW,
      y: -Math.random() * cssH,
      len: 90 + Math.random() * 180,
      speed: 0.08 + Math.random() * 0.16,
      width: 0.7 + Math.random() * 1.2,
      alpha: 0.08 + Math.random() * 0.08,
      wobble: Math.random() * Math.PI * 2,
      delay: Math.random() * 9000,
    }))
  }

  function refreshRect() {
    heroRect = hero.getBoundingClientRect()
  }

  function resize() {
    cssW = hero.clientWidth
    cssH = hero.clientHeight
    W = canvas.width = Math.max(1, Math.floor(cssW * dpr))
    H = canvas.height = Math.max(1, Math.floor(cssH * dpr))
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    baseMist = makeBaseMist()
    seedRivulets()
    refreshRect()
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      mouse.x = event.clientX - heroRect.left
      mouse.y = event.clientY - heroRect.top
    },
    { passive: true }
  )

  function drawRivulet(r, time) {
    if (time < r.delay) return
    r.y += r.speed
    r.wobble += 0.006
    const x = (r.x + Math.sin(r.wobble) * 8) * dpr
    const y = r.y * dpr
    const len = r.len * dpr

    const grad = ctx.createLinearGradient(x, y, x, y + len)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.18, `rgba(255,255,255,${r.alpha})`)
    grad.addColorStop(0.74, `rgba(255,255,255,${r.alpha * 0.5})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.strokeStyle = grad
    ctx.lineWidth = r.width * dpr
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.bezierCurveTo(x + 8 * dpr, y + len * 0.3, x - 7 * dpr, y + len * 0.7, x + 2 * dpr, y + len)
    ctx.stroke()
    ctx.restore()

    if (r.y > cssH + r.len) {
      r.x = Math.random() * cssW
      r.y = -r.len - Math.random() * cssH * 0.8
      r.delay = time + 6000 + Math.random() * 14000
    }
  }

  function drawSheen(time) {
    if (mouse.x < -1000) return
    const x = mouse.x * dpr
    const y = mouse.y * dpr
    const radius = Math.min(W, H) * 0.32
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
    g.addColorStop(0, 'rgba(255,255,255,0.055)')
    g.addColorStop(0.42, 'rgba(255,255,255,0.018)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    const sweep = (Math.sin(time * 0.00022) * 0.5 + 0.5) * W
    const lg = ctx.createLinearGradient(sweep - W * 0.18, 0, sweep + W * 0.22, H)
    lg.addColorStop(0, 'rgba(255,255,255,0)')
    lg.addColorStop(0.5, 'rgba(255,255,255,0.025)')
    lg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = lg
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
  }

  function frame(time = 0) {
    if (!running) return
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.92 + 0.04 * Math.sin(time * 0.00018)
    ctx.drawImage(baseMist, 0, 0)
    ctx.globalAlpha = 1

    for (const r of rivulets) drawRivulet(r, time)
    drawSheen(time)

    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(frame)
  }

  const stop = () => {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  resize()
  window.addEventListener('scroll', refreshRect, { passive: true })
  let resizeTimer = 0
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(resize, 150)
  })

  const themeObserver = new MutationObserver(() => {
    baseMist = makeBaseMist()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.isIntersecting ? start() : stop()
    },
    { threshold: 0.04 }
  )
  io.observe(hero)
}

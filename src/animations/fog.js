// Hero fog — 重返未来1999 · London rain-on-glass / condensation
// A milky condensation layer veils the hero. Moving the pointer "wipes" it
// clear to reveal the content behind; when the pointer rests, the fog heals
// back and the glass mists over again. Occasional rivulets trickle down for
// the rain-on-glass feel. Desktop / fine-pointer only, reduced-motion aware,
// and purely additive — it never touches the scene layouts.

export function initFog() {
  const canvas = document.getElementById('heroFog')
  const hero = document.querySelector('.scene-hero')
  if (!canvas || !hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(pointer: fine)').matches
  // Coarse-pointer (touch) devices can't hover to wipe — leaving the hero
  // permanently misted would just hide the title, so we skip the effect there.
  if (reduced || !fine) {
    canvas.style.display = 'none'
    return
  }

  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  // Offscreen layers: a static cloudy texture, and a "wiped area" mask that
  // heals (fades back to fogged) a little every frame.
  const fogTex = document.createElement('canvas')
  const ftx = fogTex.getContext('2d')
  const clearBuf = document.createElement('canvas')
  const cbx = clearBuf.getContext('2d')

  let W = 0, H = 0 // device px
  let cssW = 0, cssH = 0 // css px

  const FOG_MAX = 0.8 // idle fog opacity — strong veil, title stays a ghost
  const HEAL = 0.012 // per-frame mask decay → how fast the glass re-mists
  const BRUSH_MIN = 48 // css px
  const BRUSH_MAX = 150

  function fogTint() {
    const dark = document.documentElement.dataset.theme === 'dark'
    return dark
      ? { r: 196, g: 210, b: 226 } // cool night mist
      : { r: 236, g: 232, b: 224 } // warm pale haze
  }

  function buildTexture() {
    ftx.setTransform(1, 0, 0, 1, 0, 0)
    ftx.clearRect(0, 0, W, H)
    const { r, g, b } = fogTint()
    // Base milky wash
    ftx.fillStyle = `rgba(${r},${g},${b},0.82)`
    ftx.fillRect(0, 0, W, H)
    // Soft cloud puffs for organic density variation
    const puffs = Math.round((cssW * cssH) / 8500)
    for (let i = 0; i < puffs; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const rad = (40 + Math.random() * 170) * dpr
      const a = 0.04 + Math.random() * 0.14
      const grad = ftx.createRadialGradient(x, y, 0, x, y, rad)
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`)
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
      ftx.fillStyle = grad
      ftx.beginPath()
      ftx.arc(x, y, rad, 0, Math.PI * 2)
      ftx.fill()
    }
  }

  function stampClear(xCss, yCss, radCss, strength) {
    const x = xCss * dpr
    const y = yCss * dpr
    const rad = Math.max(1, radCss * dpr)
    const g = cbx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, `rgba(255,255,255,${strength})`)
    g.addColorStop(0.55, `rgba(255,255,255,${strength * 0.5})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    cbx.globalCompositeOperation = 'source-over'
    cbx.fillStyle = g
    cbx.beginPath()
    cbx.arc(x, y, rad, 0, Math.PI * 2)
    cbx.fill()
  }

  function resize() {
    cssW = hero.clientWidth
    cssH = hero.clientHeight
    W = Math.max(1, Math.floor(cssW * dpr))
    H = Math.max(1, Math.floor(cssH * dpr))
    for (const c of [canvas, fogTex, clearBuf]) {
      c.width = W
      c.height = H
    }
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    buildTexture()
    // Initial reveal — clear a soft swath through the centre so the title
    // greets the visitor, then it heals over ~3s and invites them to wipe.
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.clearRect(0, 0, W, H)
    stampClear(cssW * 0.42, cssH * 0.5, 250, 0.92)
    stampClear(cssW * 0.52, cssH * 0.54, 230, 0.88)
    stampClear(cssW * 0.62, cssH * 0.5, 210, 0.82)
  }

  // ── Pointer tracking (window-level; canvas is pointer-events:none) ──
  let px = -1, py = -1 // latest pointer, css px relative to hero
  let prevX = -1, prevY = -1 // pointer at previous frame
  let speed = 0 // px / frame, smoothed

  window.addEventListener(
    'pointermove',
    (e) => {
      const rect = canvas.getBoundingClientRect()
      px = e.clientX - rect.left
      py = e.clientY - rect.top
    },
    { passive: true }
  )

  function wipe() {
    if (px < 0) return
    if (prevX < 0) {
      prevX = px
      prevY = py
      return
    }
    const dx = px - prevX
    const dy = py - prevY
    const dist = Math.hypot(dx, dy)
    // Smooth the speed so the brush size doesn't jitter
    speed += (dist - speed) * 0.3
    if (dist > 0.5) {
      const rad = Math.min(BRUSH_MAX, BRUSH_MIN + speed * 1.8)
      const strength = Math.min(0.92, 0.2 + speed * 0.045)
      // Interpolate along the stroke so fast moves don't leave gaps
      const steps = Math.min(28, Math.ceil(dist / (rad * 0.4)) || 1)
      for (let i = 1; i <= steps; i++) {
        stampClear(prevX + dx * (i / steps), prevY + dy * (i / steps), rad, strength)
      }
    }
    prevX = px
    prevY = py
  }

  // ── Rain rivulets — occasional drops that trickle down leaving a trail ──
  const drips = []
  function updateDrips() {
    if (Math.random() < 0.014 && drips.length < 5) {
      drips.push({ x: Math.random() * cssW, y: -12, v: 1.4 + Math.random() * 2.4, r: 6 + Math.random() * 7 })
    }
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i]
      d.y += d.v
      d.v += 0.06
      stampClear(d.x, d.y, d.r, 0.5)
      if (d.y > cssH + 24) drips.splice(i, 1)
    }
  }

  function frame() {
    // Heal: fade the clear mask → the glass mists back over
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.globalCompositeOperation = 'destination-out'
    cbx.fillStyle = `rgba(0,0,0,${HEAL})`
    cbx.fillRect(0, 0, W, H)
    cbx.globalCompositeOperation = 'source-over'

    wipe()
    updateDrips()

    // Compose: fog texture at max alpha, then punch out the cleared areas
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, W, H)
    ctx.globalAlpha = FOG_MAX
    ctx.drawImage(fogTex, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'destination-out'
    ctx.drawImage(clearBuf, 0, 0)
    ctx.globalCompositeOperation = 'source-over'

    raf = requestAnimationFrame(frame)
  }

  let raf = 0
  const start = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  resize()
  window.addEventListener('resize', resize)

  // Rebuild the tint when the theme toggles (after the attribute flips)
  const themeBtn = document.getElementById('themeToggle')
  if (themeBtn) themeBtn.addEventListener('click', () => setTimeout(buildTexture, 0))

  // Only animate while the hero is on screen — no point burning a rAF when
  // the visitor has scrolled past it.
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) en.isIntersecting ? start() : stop()
    },
    { threshold: 0.04 }
  )
  io.observe(hero)
}

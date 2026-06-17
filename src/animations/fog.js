// Hero fog — 重返未来1999 · London rain-on-glass / frosted condensation
// ─────────────────────────────────────────────────────────────────────────
// ROOM MODEL: the copy lives inside the room (always crisp, on top); the rain
// and fog cling to the WINDOW (these layers); the background photo is the view
// OUTSIDE, behind the glass. So the glass sits below .hero-content and above the
// background — wiping clears the mist to reveal the view outside; the copy is
// never touched.
//
// Grounded in real misted-glass physics: micro-droplets scatter light, so the
// fogged outside is blurred + dimmed and bright lights bloom; the glass re-mists
// SLOWLY (condensation takes time to re-form); proper water droplets gather and
// run down the pane, washing a clear trail that gradually fogs back over.
//
// Layers:
//   • #heroFrost — backdrop-filter blur (z2) masked live by the wipe, so fogged
//     areas blur the outside view and wiped areas read sharp.
//   • #heroFog  — canvas (z2): condensation colour (steam gradient + soft cloud
//     octaves + edge-denser vignette + droplet grain, two seeds crossfading so
//     the mist breathes) minus a slowly-healing "clear" mask; plus the running
//     droplets and their bright bead heads.
//   • .hero-lights — out-of-focus warm bokeh outside the glass, blooming through.
// Desktop / fine-pointer only; reduced-motion + touch skip it. Purely additive.

export function initFog() {
  const canvas = document.getElementById('heroFog')
  const frost = document.getElementById('heroFrost')
  const hero = document.querySelector('.scene-hero')
  if (!canvas || !hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(pointer: fine)').matches
  if (reduced || !fine) {
    canvas.style.display = 'none'
    if (frost) frost.style.display = 'none'
    return
  }

  // Masked backdrop-filter is unreliable on older Safari/Firefox — fall back to
  // the canvas-only mist there (still reads as misted glass).
  const frostOk =
    !!frost &&
    !!(window.CSS && CSS.supports) &&
    (CSS.supports('backdrop-filter', 'blur(1px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(1px)'))
  if (frost && !frostOk) frost.style.display = 'none'

  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  let fogA = null // procedural condensation texture, seed A
  let fogB = null // … seed B (crossfaded with A so the mist breathes)
  const clearBuf = document.createElement('canvas') // wiped/washed mask, heals slowly
  const cbx = clearBuf.getContext('2d')
  const maskCanvas = document.createElement('canvas') // drives the frost mask
  const mctx = maskCanvas.getContext('2d')

  let W = 0, H = 0 // device px
  let cssW = 0, cssH = 0 // css px
  let mW = 0, mH = 0 // mask px
  let heroRect = canvas.getBoundingClientRect() // cached; refreshed on scroll/resize

  const FOG_MAX = 0.7 // mist opacity over the outside view
  // Re-misting is gradual (condensation takes time). A gentle per-frame fade
  // gives the slow feel; a periodic stronger pass defeats the 8-bit alpha
  // rounding floor so trails fully recover instead of stalling at ~17%.
  const HEAL = 0.009
  const HEAL_DEEP = 0.1
  const HEAL_DEEP_EVERY = 24
  const BRUSH_MIN = 48 // css px
  const BRUSH_MAX = 152
  const MASK_SCALE = 0.2

  function fogTint() {
    const dark = document.documentElement.dataset.theme === 'dark'
    return dark
      ? { r: 200, g: 214, b: 228 } // cool night mist
      : { r: 239, g: 234, b: 226 } // warm pale haze
  }

  // ── Build one procedural condensation texture (soft, even, organic) ──
  function makeFogTexture() {
    const t = document.createElement('canvas')
    t.width = W
    t.height = H
    const x = t.getContext('2d')
    const { r, g, b } = fogTint()

    // Even base wash (condensation is fairly uniform), denser toward the top
    const vg = x.createLinearGradient(0, 0, 0, H)
    vg.addColorStop(0, `rgba(${r},${g},${b},0.96)`)
    vg.addColorStop(0.5, `rgba(${r},${g},${b},0.9)`)
    vg.addColorStop(1, `rgba(${r},${g},${b},0.93)`)
    x.fillStyle = vg
    x.fillRect(0, 0, W, H)

    // Soft, low-contrast density variation (gentle, not patchy clouds)
    const area = cssW * cssH
    const octaves = [
      { count: area / 80000, rad: 240, a: 0.07 },
      { count: area / 26000, rad: 130, a: 0.055 },
      { count: area / 10000, rad: 62, a: 0.04 },
    ]
    for (const o of octaves) {
      const n = Math.max(2, Math.round(o.count))
      for (let i = 0; i < n; i++) {
        const cx = Math.random() * W
        const cy = Math.random() * H
        const rad = o.rad * (0.5 + Math.random()) * dpr
        const a = o.a * (0.5 + Math.random())
        const grad = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
        if (Math.random() < 0.55) {
          grad.addColorStop(0, `rgba(${r},${g},${b},${a})`)
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          x.globalCompositeOperation = 'source-over'
        } else {
          grad.addColorStop(0, `rgba(0,0,0,${a})`)
          grad.addColorStop(1, 'rgba(0,0,0,0)')
          x.globalCompositeOperation = 'destination-out'
        }
        x.fillStyle = grad
        x.beginPath()
        x.arc(cx, cy, rad, 0, Math.PI * 2)
        x.fill()
      }
    }
    x.globalCompositeOperation = 'source-over'

    // Vignette — denser toward the edges, like a real cold pane
    const vr = Math.max(W, H) * 0.78
    const rg = x.createRadialGradient(W / 2, H * 0.44, vr * 0.24, W / 2, H * 0.44, vr)
    rg.addColorStop(0, 'rgba(0,0,0,0)')
    rg.addColorStop(1, `rgba(${r},${g},${b},0.26)`)
    x.fillStyle = rg
    x.fillRect(0, 0, W, H)

    // Fine condensation grain — micro-beads across the glass
    const beads = Math.round(area / 1100)
    for (let i = 0; i < beads; i++) {
      const bx = Math.random() * W
      const by = Math.random() * H
      const br = (0.5 + Math.random() * 1.3) * dpr
      const lift = Math.random() < 0.5 ? 13 : -9
      x.fillStyle = `rgba(${r + lift},${g + lift},${b + lift},${0.03 + Math.random() * 0.06})`
      x.beginPath()
      x.arc(bx, by, br, 0, Math.PI * 2)
      x.fill()
    }
    return t
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

  function refreshRect() {
    heroRect = canvas.getBoundingClientRect()
  }

  function resize() {
    cssW = hero.clientWidth
    cssH = hero.clientHeight
    W = Math.max(1, Math.floor(cssW * dpr))
    H = Math.max(1, Math.floor(cssH * dpr))
    canvas.width = W
    canvas.height = H
    clearBuf.width = W
    clearBuf.height = H
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    mW = maskCanvas.width = Math.max(1, Math.round(cssW * MASK_SCALE))
    mH = maskCanvas.height = Math.max(1, Math.round(cssH * MASK_SCALE))

    fogA = makeFogTexture()
    fogB = makeFogTexture()

    // Start fully misted — the glass fogs in, the view outside is veiled, and
    // moving the pointer wipes it clear.
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.clearRect(0, 0, W, H)
    refreshRect()
  }

  // ── Pointer tracking (window-level; layers are pointer-events:none) ──
  let px = -1, py = -1
  let prevX = -1, prevY = -1
  let speed = 0

  window.addEventListener(
    'pointermove',
    (e) => {
      px = e.clientX - heroRect.left
      py = e.clientY - heroRect.top
    },
    { passive: true }
  )

  // ── Water droplets that run down the pane, washing the fog ──
  const drops = []
  function spawnDrop(x, y, r, v) {
    if (drops.length < 9) drops.push({ x, y, r, v, wob: Math.random() * 6.28, seed: Math.random() * 6.28 })
  }

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
    speed += (dist - speed) * 0.3
    if (dist > 0.5) {
      const rad = Math.min(BRUSH_MAX, BRUSH_MIN + speed * 1.8)
      const strength = Math.min(0.94, 0.22 + speed * 0.045)
      const steps = Math.min(28, Math.ceil(dist / (rad * 0.4)) || 1)
      for (let i = 1; i <= steps; i++) {
        stampClear(prevX + dx * (i / steps), prevY + dy * (i / steps), rad, strength)
      }
    }
    prevX = px
    prevY = py
  }

  function updateDrops() {
    // Normal rain on the pane — a few drops gather and run at any time.
    if (Math.random() < 0.014 && drops.length < 9) {
      spawnDrop(Math.random() * cssW, -10, 5 + Math.random() * 6, 0.8 + Math.random() * 1.6)
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]
      d.v += 0.07 // gravity
      d.y += d.v
      d.wob += 0.09
      d.x += Math.sin(d.wob + d.seed) * 1.1 // meander
      // Wash a clear trail (a touch narrower than the bead, so the head leads)
      stampClear(d.x, d.y, d.r * 0.82, 0.8)
      if (d.y > cssH + 30) drops.splice(i, 1)
    }
  }

  // Each drop reads as a clear lens (its washed centre shows the sharp view
  // outside) with a faint Fresnel rim and a tiny specular glint — like a real
  // water bead on a dark night pane, not a glowing orb.
  function drawDropHeads() {
    ctx.globalCompositeOperation = 'source-over'
    for (const d of drops) {
      const x = d.x * dpr
      const y = d.y * dpr
      const r = d.r * dpr
      // bright Fresnel rim, transparent core
      const ring = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.1)
      ring.addColorStop(0, 'rgba(255,250,240,0)')
      ring.addColorStop(0.72, 'rgba(255,250,240,0.08)')
      ring.addColorStop(0.92, 'rgba(255,250,240,0.26)')
      ring.addColorStop(1, 'rgba(255,250,240,0)')
      ctx.fillStyle = ring
      ctx.beginPath()
      ctx.arc(x, y, r * 1.1, 0, Math.PI * 2)
      ctx.fill()
      // small specular highlight, upper-left
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath()
      ctx.arc(x - r * 0.3, y - r * 0.3, Math.max(1, r * 0.16), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Update the frost backdrop-blur mask: white where fogged, holes where washed
  let maskTick = 0
  function updateFrostMask() {
    if (!frostOk) return
    maskTick++
    if (maskTick % 4 !== 0) return // ~15fps is plenty for a soft mask
    mctx.setTransform(1, 0, 0, 1, 0, 0)
    mctx.globalCompositeOperation = 'source-over'
    mctx.fillStyle = '#fff'
    mctx.fillRect(0, 0, mW, mH)
    mctx.globalCompositeOperation = 'destination-out'
    mctx.drawImage(clearBuf, 0, 0, mW, mH)
    mctx.globalCompositeOperation = 'source-over'
    const url = maskCanvas.toDataURL()
    frost.style.webkitMaskImage = `url(${url})`
    frost.style.maskImage = `url(${url})`
  }

  let running = false
  let healTick = 0
  function frame(time) {
    if (!running) return
    // Heal: the glass slowly re-mists over wiped/washed areas.
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.globalCompositeOperation = 'destination-out'
    cbx.fillStyle = `rgba(0,0,0,${HEAL})`
    cbx.fillRect(0, 0, W, H)
    if (++healTick % HEAL_DEEP_EVERY === 0) {
      cbx.fillStyle = `rgba(0,0,0,${HEAL_DEEP})`
      cbx.fillRect(0, 0, W, H)
    }
    cbx.globalCompositeOperation = 'source-over'

    wipe()
    updateDrops()

    // Compose milky tint: crossfade two textures (breathing) then punch holes
    const breath = FOG_MAX * (1 + 0.04 * Math.sin(time * 0.0006))
    const mix = 0.5 + 0.5 * Math.sin(time * 0.00035)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, W, H)
    ctx.globalAlpha = breath * (1 - mix)
    ctx.drawImage(fogA, 0, 0)
    ctx.globalAlpha = breath * mix
    ctx.drawImage(fogB, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'destination-out'
    ctx.drawImage(clearBuf, 0, 0)
    ctx.globalCompositeOperation = 'source-over'

    drawDropHeads()
    updateFrostMask()
    raf = requestAnimationFrame(frame)
  }

  let raf = 0
  const start = () => {
    if (!running) {
      running = true
      raf = requestAnimationFrame(frame)
    }
  }
  const stop = () => {
    running = false
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  resize()
  window.addEventListener('scroll', refreshRect, { passive: true })

  // Debounced resize — avoid re-allocating two full textures on every drag tick
  let resizeTimer = 0
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(resize, 150)
  })

  // Rebuild the mist tint when the theme actually flips
  const themeObserver = new MutationObserver(() => {
    fogA = makeFogTexture()
    fogB = makeFogTexture()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // Only animate while the hero is on screen
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) en.isIntersecting ? start() : stop()
    },
    { threshold: 0.04 }
  )
  io.observe(hero)
}

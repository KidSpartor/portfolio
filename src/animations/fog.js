// Hero fog — 重返未来1999 · London rain-on-glass / frosted condensation
// ─────────────────────────────────────────────────────────────────────────
// The glass sits BEHIND the hero copy: the editorial type stays crisp on top
// while the misted window blurs the background + bokeh when fogged and
// sharpens where the pointer wipes. Two layers:
//   • #heroFrost — a backdrop-filter blur layer (z2), masked live by the wipe,
//     so fogged areas blur + dim the background while wiped areas stay sharp.
//   • #heroFog  — a canvas (z2) carrying the condensation colour: a procedural
//     texture (steam gradient + cloud octaves + vignette + droplet grain), two
//     seeds crossfading so the mist breathes, minus a healing "clear" mask.
//   • .hero-lights — out-of-focus warm bokeh behind the glass; wiping reveals
//     a glowing rainy London night.
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
  const clearBuf = document.createElement('canvas') // wiped-area mask, heals over time
  const cbx = clearBuf.getContext('2d')
  const maskCanvas = document.createElement('canvas') // drives the frost mask
  const mctx = maskCanvas.getContext('2d')

  let W = 0, H = 0 // device px
  let cssW = 0, cssH = 0 // css px
  let mW = 0, mH = 0 // mask px
  let heroRect = canvas.getBoundingClientRect() // cached; refreshed on scroll/resize

  const FOG_MAX = 0.66 // milky tint opacity (the blur layer carries the rest)
  const HEAL = 0.03 // per-frame mask decay → how fast the glass re-mists
  const BRUSH_MIN = 50 // css px
  const BRUSH_MAX = 158
  const MASK_SCALE = 0.2 // frost-mask resolution relative to viewport

  function fogTint() {
    const dark = document.documentElement.dataset.theme === 'dark'
    return dark
      ? { r: 198, g: 212, b: 228 } // cool night mist
      : { r: 238, g: 233, b: 224 } // warm pale haze
  }

  // ── Build one procedural condensation texture ──
  function makeFogTexture() {
    const t = document.createElement('canvas')
    t.width = W
    t.height = H
    const x = t.getContext('2d')
    const { r, g, b } = fogTint()

    const vg = x.createLinearGradient(0, 0, 0, H)
    vg.addColorStop(0, `rgba(${r},${g},${b},0.94)`)
    vg.addColorStop(0.55, `rgba(${r},${g},${b},0.82)`)
    vg.addColorStop(1, `rgba(${r},${g},${b},0.88)`)
    x.fillStyle = vg
    x.fillRect(0, 0, W, H)

    const area = cssW * cssH
    const octaves = [
      { count: area / 70000, rad: 230, a: 0.13 },
      { count: area / 24000, rad: 120, a: 0.1 },
      { count: area / 9000, rad: 58, a: 0.07 },
    ]
    for (const o of octaves) {
      const n = Math.max(2, Math.round(o.count))
      for (let i = 0; i < n; i++) {
        const cx = Math.random() * W
        const cy = Math.random() * H
        const rad = o.rad * (0.5 + Math.random()) * dpr
        const a = o.a * (0.5 + Math.random())
        const grad = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
        if (Math.random() < 0.58) {
          grad.addColorStop(0, `rgba(${r},${g},${b},${a})`)
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          x.globalCompositeOperation = 'source-over'
        } else {
          grad.addColorStop(0, `rgba(0,0,0,${a * 0.9})`)
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

    const vr = Math.max(W, H) * 0.78
    const rg = x.createRadialGradient(W / 2, H * 0.44, vr * 0.22, W / 2, H * 0.44, vr)
    rg.addColorStop(0, 'rgba(0,0,0,0)')
    rg.addColorStop(1, `rgba(${r},${g},${b},0.28)`)
    x.fillStyle = rg
    x.fillRect(0, 0, W, H)

    const beads = Math.round(area / 1100)
    for (let i = 0; i < beads; i++) {
      const bx = Math.random() * W
      const by = Math.random() * H
      const br = (0.5 + Math.random() * 1.4) * dpr
      const lift = Math.random() < 0.5 ? 14 : -10
      x.fillStyle = `rgba(${r + lift},${g + lift},${b + lift},${0.03 + Math.random() * 0.07})`
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

    // Gentle initial hint — a soft, even clearing low on the glass that heals
    // within a couple of seconds into uniform mist, teasing the lit city behind
    // and inviting a wipe. (The copy sits above the glass, so no reveal needed
    // for legibility.)
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.clearRect(0, 0, W, H)
    stampClear(cssW * 0.5, cssH * 0.62, 320, 0.5)
    stampClear(cssW * 0.7, cssH * 0.58, 220, 0.4)
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

  // Rivulets / clinging beads — meander down leaving a healing trail
  const drips = []
  function spawnDrip(x, y, r, v) {
    if (drips.length < 18) drips.push({ x, y, v, r, wob: 0, seed: Math.random() * 6.28 })
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
      if (speed > 7 && Math.random() < 0.5) {
        spawnDrip(prevX + (Math.random() - 0.5) * rad, prevY + rad * 0.3, 4 + Math.random() * 5, 0.6 + Math.random() * 1.2)
      }
    }
    prevX = px
    prevY = py
  }

  function updateDrips() {
    if (Math.random() < 0.01 && drips.length < 18) {
      spawnDrip(Math.random() * cssW, -12, 4 + Math.random() * 5, 1.3 + Math.random() * 2.2)
    }
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i]
      d.y += d.v
      d.v += 0.05
      d.wob += 0.08
      d.x += Math.sin(d.wob + d.seed) * 0.9
      stampClear(d.x, d.y, d.r, 0.5)
      if (d.y > cssH + 24) drips.splice(i, 1)
    }
  }

  // Update the frost backdrop-blur mask: white where fogged, holes where wiped
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
    // Heal: fade the clear mask so the glass mists back over. A gentle per-frame
    // multiplicative fade looks smooth but, because of 8-bit alpha rounding, it
    // STALLS around ~17% (alpha × HEAL rounds to 0) — leaving permanent ghost
    // trails from every wipe and rivulet. A periodic stronger pass crushes that
    // residual so wiped areas fully re-fog.
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.globalCompositeOperation = 'destination-out'
    cbx.fillStyle = `rgba(0,0,0,${HEAL})`
    cbx.fillRect(0, 0, W, H)
    if (++healTick % 18 === 0) {
      cbx.fillStyle = 'rgba(0,0,0,0.12)'
      cbx.fillRect(0, 0, W, H)
    }
    cbx.globalCompositeOperation = 'source-over'

    wipe()
    updateDrips()

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

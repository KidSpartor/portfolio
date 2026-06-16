// Hero fog — 重返未来1999 · London rain-on-glass / frosted condensation
// ─────────────────────────────────────────────────────────────────────────
// Two stacked layers create real misted glass:
//   • #heroFrost — a backdrop-filter blur layer, masked live by the wipe, so
//     fogged areas genuinely blur + dim the content behind while wiped areas
//     stay sharp.
//   • #heroFog  — a canvas carrying the condensation colour: a multi-octave
//     procedural texture (steam gradient + cloud octaves + vignette + droplet
//     grain), two seeds crossfading so the mist breathes, plus rivulets that
//     trickle down and beads that cling to a fresh wipe.
// The pointer "wipes" both clear; resting lets the glass mist back over.
// Desktop / fine-pointer only, reduced-motion + touch skip it. Purely additive.

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

  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  // Offscreen layers
  let fogA = null // procedural condensation texture, seed A
  let fogB = null // … seed B (crossfaded with A so the mist breathes)
  const clearBuf = document.createElement('canvas') // wiped-area mask, heals over time
  const cbx = clearBuf.getContext('2d')
  // Low-res mask that drives the frost backdrop-blur (cheap to serialise)
  const maskCanvas = document.createElement('canvas')
  const mctx = maskCanvas.getContext('2d')

  let W = 0, H = 0 // device px
  let cssW = 0, cssH = 0 // css px
  let mW = 0, mH = 0 // mask px (≈ quarter res)

  const FOG_MAX = 0.66 // milky tint opacity (the blur layer carries the rest)
  const HEAL = 0.011 // per-frame mask decay → how fast the glass re-mists
  const BRUSH_MIN = 50 // css px
  const BRUSH_MAX = 158
  const MASK_SCALE = 0.26 // frost-mask resolution relative to viewport

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

    // Steam gradient — denser toward the top, like condensation rising
    const vg = x.createLinearGradient(0, 0, 0, H)
    vg.addColorStop(0, `rgba(${r},${g},${b},0.94)`)
    vg.addColorStop(0.55, `rgba(${r},${g},${b},0.82)`)
    vg.addColorStop(1, `rgba(${r},${g},${b},0.88)`)
    x.fillStyle = vg
    x.fillRect(0, 0, W, H)

    // Cloud octaves — large faint billows down to small wisps, some additive,
    // some subtractive, for organic fbm-like density.
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
          // thin spots — let a little content peek through
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

    // Vignette — thicken the mist toward the edges so it frames the content
    const vr = Math.max(W, H) * 0.78
    const rg = x.createRadialGradient(W / 2, H * 0.44, vr * 0.22, W / 2, H * 0.44, vr)
    rg.addColorStop(0, 'rgba(0,0,0,0)')
    rg.addColorStop(1, `rgba(${r},${g},${b},0.28)`)
    x.fillStyle = rg
    x.fillRect(0, 0, W, H)

    // Fine condensation grain — micro-beads scattered across the glass
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

    // Initial reveal — clear a soft swath through the centre so the title
    // greets the visitor, then it heals over ~3s and invites them to wipe.
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.clearRect(0, 0, W, H)
    stampClear(cssW * 0.42, cssH * 0.5, 260, 0.94)
    stampClear(cssW * 0.52, cssH * 0.54, 235, 0.9)
    stampClear(cssW * 0.63, cssH * 0.5, 215, 0.84)
  }

  // ── Pointer tracking (window-level; layers are pointer-events:none) ──
  let px = -1, py = -1
  let prevX = -1, prevY = -1
  let speed = 0

  window.addEventListener(
    'pointermove',
    (e) => {
      const rect = canvas.getBoundingClientRect()
      px = e.clientX - rect.left
      py = e.clientY - rect.top
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
      // A brisk wipe flings a couple of beads off the trailing edge
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
      // meander like real water finding its path down the glass
      d.wob += 0.08
      d.x += Math.sin(d.wob + d.seed) * 0.9
      stampClear(d.x, d.y, d.r, 0.5)
      if (d.y > cssH + 24) drips.splice(i, 1)
    }
  }

  // Update the frost backdrop-blur mask: white where fogged, holes where wiped
  let maskTick = 0
  function updateFrostMask() {
    if (!frost) return
    maskTick++
    if (maskTick % 3 !== 0) return // ~20fps is plenty for a soft mask
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

  function frame(time) {
    // Heal: fade the clear mask → the glass mists back over
    cbx.setTransform(1, 0, 0, 1, 0, 0)
    cbx.globalCompositeOperation = 'destination-out'
    cbx.fillStyle = `rgba(0,0,0,${HEAL})`
    cbx.fillRect(0, 0, W, H)
    cbx.globalCompositeOperation = 'source-over'

    wipe()
    updateDrips()

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

    updateFrostMask()
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

  const themeBtn = document.getElementById('themeToggle')
  if (themeBtn) {
    themeBtn.addEventListener('click', () =>
      setTimeout(() => {
        fogA = makeFogTexture()
        fogB = makeFogTexture()
      }, 0)
    )
  }

  // Only animate while the hero is on screen
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) en.isIntersecting ? start() : stop()
    },
    { threshold: 0.04 }
  )
  io.observe(hero)
}

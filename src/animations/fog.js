// Hero window — London rain and mist on glass.
// Room model: the copy is inside the room and remains crisp above this layer.
// The background photograph is outside the window. This canvas and the frost
// layer are the glass: pointer movement clears condensation, then it slowly
// returns; occasional raindrops pull narrow clear trails down the pane.

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
  const clearBuf = document.createElement('canvas')
  const clearCtx = clearBuf.getContext('2d')
  const frostMask = document.createElement('canvas')
  const maskCtx = frostMask.getContext('2d')

  const MASK_SCALE = 0.18
  const FOG_ALPHA = 0.74
  const HEAL_ALPHA = 0.01
  const HEAL_DEEP_ALPHA = 0.12
  const RESIDUE_CUTOFF = 10
  const BRUSH_MIN = 30
  const BRUSH_MAX = 84
  const DROP_MAX_DESKTOP = 4
  const DROP_MAX_MOBILE = 3

  let W = 0
  let H = 0
  let cssW = 0
  let cssH = 0
  let maskW = 0
  let maskH = 0
  let baseMist = null
  let heroRect = hero.getBoundingClientRect()
  let pointer = { x: -1, y: -1, px: -1, py: -1, speed: 0 }
  let drops = []
  let raf = 0
  let running = false
  let tick = 0

  const hasBackdropMask =
    !!frost &&
    !!(window.CSS && CSS.supports) &&
    (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'))

  if (frost && !hasBackdropMask) frost.style.display = 'none'

  function tint() {
    const dark = document.documentElement.dataset.theme === 'dark'
    return dark
      ? { r: 194, g: 207, b: 221 }
      : { r: 236, g: 231, b: 222 }
  }

  function makeBaseMist() {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const x = c.getContext('2d')
    const { r, g, b } = tint()
    const area = cssW * cssH

    const wash = x.createLinearGradient(0, 0, 0, H)
    wash.addColorStop(0, `rgba(${r},${g},${b},0.92)`)
    wash.addColorStop(0.46, `rgba(${r},${g},${b},0.76)`)
    wash.addColorStop(1, `rgba(${r},${g},${b},0.84)`)
    x.fillStyle = wash
    x.fillRect(0, 0, W, H)

    const patches = Math.max(10, Math.round(area / 72000))
    for (let i = 0; i < patches; i++) {
      const cx = Math.random() * W
      const cy = Math.random() * H
      const rad = (110 + Math.random() * 320) * dpr
      const g1 = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
      const light = Math.random() < 0.62
      if (light) {
        g1.addColorStop(0, `rgba(${r + 10},${g + 10},${b + 10},${0.045 + Math.random() * 0.05})`)
      } else {
        g1.addColorStop(0, `rgba(${Math.max(0, r - 42)},${Math.max(0, g - 34)},${Math.max(0, b - 24)},0.035)`)
      }
      g1.addColorStop(1, `rgba(${r},${g},${b},0)`)
      x.fillStyle = g1
      x.beginPath()
      x.arc(cx, cy, rad, 0, Math.PI * 2)
      x.fill()
    }

    const beads = Math.round(area / 1400)
    for (let i = 0; i < beads; i++) {
      const bx = Math.random() * W
      const by = Math.random() * H
      const br = (0.35 + Math.random() * 1.1) * dpr
      x.fillStyle = `rgba(255,255,255,${0.025 + Math.random() * 0.055})`
      x.beginPath()
      x.arc(bx, by, br, 0, Math.PI * 2)
      x.fill()
    }

    const edge = x.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.24, W / 2, H * 0.48, Math.max(W, H) * 0.72)
    edge.addColorStop(0, 'rgba(0,0,0,0)')
    edge.addColorStop(1, `rgba(${r},${g},${b},0.28)`)
    x.fillStyle = edge
    x.fillRect(0, 0, W, H)

    return c
  }

  function refreshRect() {
    heroRect = hero.getBoundingClientRect()
  }

  function resize() {
    cssW = hero.clientWidth
    cssH = hero.clientHeight
    W = canvas.width = Math.max(1, Math.floor(cssW * dpr))
    H = canvas.height = Math.max(1, Math.floor(cssH * dpr))
    clearBuf.width = W
    clearBuf.height = H
    maskW = frostMask.width = Math.max(1, Math.round(cssW * MASK_SCALE))
    maskH = frostMask.height = Math.max(1, Math.round(cssH * MASK_SCALE))
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    baseMist = makeBaseMist()
    drops = []
    clearCtx.clearRect(0, 0, W, H)
    refreshRect()
  }

  function stampClear(xCss, yCss, radiusCss, strength = 0.75) {
    const x = xCss * dpr
    const y = yCss * dpr
    const r = Math.max(1, radiusCss * dpr)
    const g = clearCtx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${strength})`)
    g.addColorStop(0.32, `rgba(255,255,255,${strength * 0.42})`)
    g.addColorStop(0.7, `rgba(255,255,255,${strength * 0.12})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    clearCtx.globalCompositeOperation = 'source-over'
    clearCtx.fillStyle = g
    clearCtx.beginPath()
    clearCtx.arc(x, y, r, 0, Math.PI * 2)
    clearCtx.fill()
  }

  function movePointer(event) {
    pointer.x = event.clientX - heroRect.left
    pointer.y = event.clientY - heroRect.top
  }

  window.addEventListener('pointermove', movePointer, { passive: true })

  function wipeByPointer() {
    if (pointer.x < 0 || pointer.y < 0 || pointer.x > cssW || pointer.y > cssH) return
    if (pointer.px < 0) {
      pointer.px = pointer.x
      pointer.py = pointer.y
      stampClear(pointer.x, pointer.y, 38, 0.34)
      return
    }

    const dx = pointer.x - pointer.px
    const dy = pointer.y - pointer.py
    const dist = Math.hypot(dx, dy)
    pointer.speed += (dist - pointer.speed) * 0.28
    if (dist > 0.35) {
      const radius = Math.min(BRUSH_MAX, BRUSH_MIN + pointer.speed * 0.92)
      const strength = Math.min(0.62, 0.24 + pointer.speed * 0.026)
      const steps = Math.min(24, Math.max(1, Math.ceil(dist / Math.max(14, radius * 0.26))))
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        stampClear(pointer.px + dx * t, pointer.py + dy * t, radius, strength)
      }
    }

    pointer.px = pointer.x
    pointer.py = pointer.y
  }

  function maybeSpawnDrop(time) {
    const maxDrops = cssW < 700 ? DROP_MAX_MOBILE : DROP_MAX_DESKTOP
    if (drops.length >= maxDrops) return
    const chance = cssW < 700 ? 0.0026 : 0.0038
    if (Math.random() > chance) return
    drops.push({
      x: Math.random() * cssW,
      y: -24 - Math.random() * 80,
      r: 2.6 + Math.random() * 3.8,
      vy: 0.45 + Math.random() * 0.82,
      wobble: Math.random() * Math.PI * 2,
      born: time,
      wait: Math.random() * 1200,
    })
  }

  function updateDrops(time) {
    maybeSpawnDrop(time)
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]
      if (time - d.born < d.wait) continue
      d.vy += 0.006
      d.y += d.vy
      d.wobble += 0.018
      d.x += Math.sin(d.wobble) * 0.18
      stampClear(d.x, d.y, d.r * 0.86, 0.42)
      if (d.y > cssH + 60) drops.splice(i, 1)
    }
  }

  function healClearMask() {
    clearCtx.globalCompositeOperation = 'destination-out'
    clearCtx.fillStyle = `rgba(0,0,0,${HEAL_ALPHA})`
    clearCtx.fillRect(0, 0, W, H)
    if (tick % 50 === 0) {
      clearCtx.fillStyle = `rgba(0,0,0,${HEAL_DEEP_ALPHA})`
      clearCtx.fillRect(0, 0, W, H)
    }
    clearCtx.globalCompositeOperation = 'source-over'
  }

  function clearFaintResidue() {
    if (tick % 150 !== 0) return
    const image = clearCtx.getImageData(0, 0, W, H)
    const data = image.data
    let changed = false
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0 && data[i] < RESIDUE_CUTOFF) {
        data[i] = 0
        changed = true
      }
    }
    if (changed) clearCtx.putImageData(image, 0, 0)
  }

  function updateFrostMask() {
    if (!hasBackdropMask || tick % 4 !== 0) return
    maskCtx.globalCompositeOperation = 'source-over'
    maskCtx.fillStyle = '#fff'
    maskCtx.fillRect(0, 0, maskW, maskH)
    maskCtx.globalCompositeOperation = 'destination-out'
    maskCtx.drawImage(clearBuf, 0, 0, maskW, maskH)
    maskCtx.globalCompositeOperation = 'source-over'
    const url = frostMask.toDataURL('image/png')
    frost.style.webkitMaskImage = `url(${url})`
    frost.style.maskImage = `url(${url})`
  }

  function drawClearedGlassSheen() {
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.18
    ctx.filter = `blur(${1.4 * dpr}px)`
    ctx.drawImage(clearBuf, 0, 0)
    ctx.filter = 'none'
    ctx.globalAlpha = 1
    ctx.restore()
  }

  function drawRainThreads(time) {
    const { r, g, b } = tint()
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.lineWidth = Math.max(0.45, dpr * 0.55)
    const count = cssW < 700 ? 8 : 16
    for (let i = 0; i < count; i++) {
      const seed = i * 83.17
      const x = ((seed * 17 + time * 0.012) % (cssW + 240) - 120) * dpr
      const y = ((seed * 31 + time * 0.028) % (cssH + 180) - 90) * dpr
      ctx.strokeStyle = `rgba(${r + 18},${g + 18},${b + 18},0.045)`
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 7 * dpr, y + 34 * dpr)
      ctx.stroke()
    }
    ctx.restore()
  }

  function frame(time = 0) {
    if (!running) return
    tick++
    healClearMask()
    clearFaintResidue()
    wipeByPointer()
    updateDrops(time)

    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = FOG_ALPHA * (0.97 + 0.03 * Math.sin(time * 0.0005))
    ctx.drawImage(baseMist, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'destination-out'
    ctx.drawImage(clearBuf, 0, 0)
    ctx.globalCompositeOperation = 'source-over'

    drawClearedGlassSheen()
    drawRainThreads(time)
    updateFrostMask()
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

import { FogField } from './fog-field.js'

export function initFog() {
  const canvas = document.getElementById('heroFog')
  const frost = document.getElementById('heroFrost')
  const hero = document.querySelector('.scene-hero')
  if (!canvas || !hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const ctx = canvas.getContext('2d')
  const glassMask = document.createElement('canvas')
  const maskCtx = glassMask.getContext('2d')
  const frostMask = document.createElement('canvas')
  const frostCtx = frostMask.getContext('2d')
  if (!ctx || !maskCtx || !frostCtx) return
  canvas.glassMask = glassMask

  const hasBackdropMask = !!frost &&
    (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'))
  if (frost && !hasBackdropMask) frost.style.display = 'none'

  let W = 1
  let H = 1
  let cssW = 1
  let cssH = 1
  let dpr = 1
  let maskScale = 1
  let field
  let pixels
  let baseMist
  let heroRect = hero.getBoundingClientRect()
  let pointer = null
  let capturedPointer = null
  let drops = []
  let raf = 0
  let visible = true
  let previousTime = 0
  let lastPaint = 0
  let lastFrostPaint = 0
  let activeMarks = false
  let maskDirty = true
  let mistDirty = true
  let frostDirty = true
  let hadGlassRenderer = false
  let environment = { humidity: 0.68, rain: 0.16, wind: 0.24, density: 0.62 }

  function tint() {
    const dark = document.documentElement.dataset.theme === 'dark'
    return dark
      ? { r: 176, g: 194, b: 211 }
      : { r: 235, g: 232, b: 225 }
  }

  function seeded(index) {
    const value = Math.sin(index * 91.731 + cssW * 0.013 + cssH * 0.017) * 43758.5453
    return value - Math.floor(value)
  }

  function makeBaseMist() {
    const mist = document.createElement('canvas')
    mist.width = W
    mist.height = H
    const mistCtx = mist.getContext('2d')
    const { r, g, b } = tint()
    const area = cssW * cssH

    const wash = mistCtx.createLinearGradient(0, 0, W, H)
    wash.addColorStop(0, `rgba(${r + 8},${g + 8},${b + 8},0.9)`)
    wash.addColorStop(0.48, `rgba(${r},${g},${b},0.72)`)
    wash.addColorStop(1, `rgba(${r - 12},${g - 8},${b - 4},0.84)`)
    mistCtx.fillStyle = wash
    mistCtx.fillRect(0, 0, W, H)

    const patches = Math.max(12, Math.round(area / 64000))
    for (let i = 0; i < patches; i++) {
      const cx = seeded(i * 4 + 1) * W
      const cy = seeded(i * 4 + 2) * H
      const radius = (120 + seeded(i * 4 + 3) * 300) * dpr
      const patch = mistCtx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      const light = seeded(i * 4 + 4) > 0.36
      patch.addColorStop(0, light
        ? `rgba(255,255,255,${0.035 + seeded(i + 80) * 0.055})`
        : `rgba(58,72,88,${0.025 + seeded(i + 120) * 0.035})`)
      patch.addColorStop(1, 'rgba(255,255,255,0)')
      mistCtx.fillStyle = patch
      mistCtx.beginPath()
      mistCtx.arc(cx, cy, radius, 0, Math.PI * 2)
      mistCtx.fill()
    }

    const beads = Math.round(area / 2600)
    for (let i = 0; i < beads; i++) {
      const bx = seeded(i * 3 + 401) * W
      const by = seeded(i * 3 + 402) * H
      const br = (0.28 + seeded(i * 3 + 403) * 0.9) * dpr
      mistCtx.fillStyle = `rgba(255,255,255,${0.018 + seeded(i + 700) * 0.04})`
      mistCtx.beginPath()
      mistCtx.arc(bx, by, br, 0, Math.PI * 2)
      mistCtx.fill()
    }

    return mist
  }

  function resetPointer() {
    pointer = null
  }

  function refreshRect() {
    heroRect = hero.getBoundingClientRect()
    resetPointer()
  }

  function publishMask() {
    window.dispatchEvent(new CustomEvent('glassmaskchange', { detail: { canvas: glassMask } }))
  }

  function resize() {
    const width = Math.max(1, hero.clientWidth)
    const height = Math.max(1, hero.clientHeight)
    const ratio = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5)
    if (field && width === cssW && height === cssH && ratio === dpr) return
    cssW = width
    cssH = height
    dpr = ratio
    W = canvas.width = Math.max(1, Math.floor(cssW * dpr))
    H = canvas.height = Math.max(1, Math.floor(cssH * dpr))
    maskScale = Math.min(0.4, 512 / Math.max(cssW, cssH))
    glassMask.width = frostMask.width = Math.max(1, Math.ceil(cssW * maskScale))
    glassMask.height = frostMask.height = Math.max(1, Math.ceil(cssH * maskScale))
    field = new FogField(glassMask.width, glassMask.height)
    pixels = maskCtx.createImageData(glassMask.width, glassMask.height)
    field.render(performance.now(), pixels.data)
    maskCtx.putImageData(pixels, 0, 0)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    baseMist = makeBaseMist()
    drops = []
    activeMarks = false
    maskDirty = mistDirty = frostDirty = true
    refreshRect()
    publishMask()
  }

  function markGlass(x0, y0, x1, y1, radius, strength, time) {
    field.stampSegment(x0 * maskScale, y0 * maskScale, x1 * maskScale, y1 * maskScale,
      radius * maskScale, strength, time)
    maskDirty = true
    activeMarks = true
  }

  // Copy and controls retain native selection/click behavior. A drag that starts
  // on the glass owns only that gesture; touch always retains native scrolling.
  function isProtectedSurface(event) {
    const target = document.elementFromPoint(event.clientX, event.clientY)
    if (!target || !hero.contains(target)) return true
    if (target.closest('a, button, input, textarea, select, [contenteditable], .hero-practice, .hero-eyebrow, .hero-scroll-cue')) return true
    const copy = target.closest('h1, h2, h3, p')
    if (!copy) return false
    // A heading's block box includes empty glass to the right of its text.
    // Protect the text itself rather than turning that empty area into selection.
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    while (walker.nextNode()) {
      range.selectNodeContents(walker.currentNode)
      for (const rect of range.getClientRects()) {
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) return true
      }
    }
    return false
  }

  function canWipe(event) {
    if (reduced.matches || event.pointerType === 'touch') return false
    if (event.buttons && capturedPointer !== event.pointerId) return false
    return !isProtectedSurface(event)
  }

  function movePointer(event) {
    if (!canWipe(event)) {
      resetPointer()
      return
    }
    const time = performance.now()
    const x = event.clientX - heroRect.left
    const y = event.clientY - heroRect.top
    if (x < 0 || y < 0 || x > cssW || y > cssH) {
      resetPointer()
      return
    }
    if (!pointer || time - pointer.time > 250) {
      markGlass(x, y, x, y, 28, 0.98, time)
      pointer = { x, y, time, speed: 0 }
      return
    }
    const distance = Math.hypot(x - pointer.x, y - pointer.y)
    if (distance < 0.6) return
    const seconds = Math.max(0.004, (time - pointer.time) / 1000)
    const speed = pointer.speed + (Math.min(1800, distance / seconds) - pointer.speed) * (1 - Math.exp(-seconds / 0.06))
    const radius = 28 + Math.min(1, speed / 1400) * 16
    markGlass(pointer.x, pointer.y, x, y, radius, 0.98, time)
    pointer = { x, y, time, speed }
  }

  hero.addEventListener('pointermove', movePointer, { passive: true })
  hero.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.pointerType === 'touch' || reduced.matches) return
    // Check the surface before claiming the pressed pointer.
    if (isProtectedSurface(event)) return
    capturedPointer = event.pointerId
    hero.setPointerCapture(event.pointerId)
    event.preventDefault()
    resetPointer()
    movePointer(event)
  })

  function releasePointer() {
    if (capturedPointer !== null && hero.hasPointerCapture(capturedPointer)) hero.releasePointerCapture(capturedPointer)
    capturedPointer = null
    resetPointer()
  }
  hero.addEventListener('pointerup', releasePointer)
  hero.addEventListener('pointercancel', releasePointer)
  hero.addEventListener('lostpointercapture', () => {
    capturedPointer = null
    resetPointer()
  })
  hero.addEventListener('pointerleave', resetPointer)

  function updateDrops(time, dt) {
    const maxDrops = cssW < 700 ? 1 : 2
    const perFrameChance = 0.00022 + environment.rain * 0.0016
    const chance = 1 - Math.pow(1 - perFrameChance, dt * 60)
    if (drops.length < maxDrops && Math.random() < chance) {
      drops.push({
        x: cssW * (0.08 + Math.random() * 0.84),
        y: -40 - Math.random() * 100,
        radius: 2.2 + Math.random() * 2.8,
        velocity: (0.42 + Math.random() * 0.62 + environment.rain * 0.24) * 60,
        wobble: Math.random() * Math.PI * 2,
        startsAt: time + 500 + Math.random() * 1800,
      })
    }
    for (let index = drops.length - 1; index >= 0; index--) {
      const drop = drops[index]
      if (time < drop.startsAt) continue
      const x = drop.x
      const y = drop.y
      const acceleration = (0.004 + environment.rain * 0.003) * 3600
      drop.y += drop.velocity * dt + 0.5 * acceleration * dt * dt
      drop.velocity += acceleration * dt
      drop.wobble += (0.015 + environment.wind * 0.012) * dt * 60
      drop.x += Math.sin(drop.wobble) * (0.08 + environment.wind * 0.16) * dt * 60
      markGlass(x, y, drop.x, drop.y, drop.radius * 0.86, 0.64, time)
      if (drop.y > cssH + 50) drops.splice(index, 1)
    }
  }

  function updateFrostMask(time, force = false) {
    const glassReady = hero.classList.contains('window-glass-ready')
    if (hadGlassRenderer && !glassReady) frostDirty = true
    hadGlassRenderer = glassReady
    if (!hasBackdropMask || glassReady || !frostDirty) return
    if (!force && activeMarks && time - lastFrostPaint < 80) return
    // Only the non-WebGL fallback serializes a mask, and only while it changes.
    frostCtx.globalCompositeOperation = 'source-over'
    frostCtx.fillStyle = '#fff'
    frostCtx.fillRect(0, 0, frostMask.width, frostMask.height)
    frostCtx.globalCompositeOperation = 'destination-out'
    frostCtx.drawImage(glassMask, 0, 0)
    const url = frostMask.toDataURL('image/png')
    frost.style.webkitMaskImage = frost.style.maskImage = `url(${url})`
    frostDirty = false
    lastFrostPaint = time
  }

  function paint(time) {
    if (maskDirty || (activeMarks && time - lastPaint >= 1000 / 30)) {
      activeMarks = field.render(time, pixels.data)
      maskCtx.putImageData(pixels, 0, 0)
      publishMask()
      maskDirty = false
      mistDirty = frostDirty = true
      lastPaint = time
    }
    if (mistDirty) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, W, H)
      ctx.globalAlpha = 0.30 + environment.density * 0.20
      ctx.drawImage(baseMist, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'destination-out'
      ctx.drawImage(glassMask, 0, 0, W, H)
      ctx.globalCompositeOperation = 'source-over'
      mistDirty = false
    }
    updateFrostMask(time)
  }

  function frame(time) {
    raf = 0
    if (!visible || document.hidden || reduced.matches) return
    const dt = previousTime ? Math.min(0.05, (time - previousTime) / 1000) : 0
    previousTime = time
    updateDrops(time, dt)
    paint(time)
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (!raf && visible && !document.hidden && !reduced.matches) {
      previousTime = 0
      raf = requestAnimationFrame(frame)
    }
  }

  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
    previousTime = 0
    releasePointer()
  }

  function applyMotionPreference() {
    canvas.style.display = reduced.matches ? 'none' : ''
    hero.classList.toggle('fog-static', reduced.matches)
    if (reduced.matches) {
      stop()
      field.reset()
      drops = []
      maskDirty = true
      paint(performance.now())
    } else start()
  }

  window.addEventListener('ambientchange', (event) => {
    environment = { ...environment, ...(event.detail || {}) }
    baseMist = makeBaseMist()
    mistDirty = true
  })
  new MutationObserver(() => {
    baseMist = makeBaseMist()
    mistDirty = true
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  new ResizeObserver(resize).observe(hero)
  window.addEventListener('scroll', refreshRect, { passive: true })
  window.addEventListener('resize', resize, { passive: true })
  new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false
    visible ? start() : stop()
  }, { threshold: 0.03 }).observe(hero)
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start())
  reduced.addEventListener('change', applyMotionPreference)

  resize()
  paint(performance.now())
  applyMotionPreference()
}

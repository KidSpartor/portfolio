// Condensation on the hero window.
// Two clearing masks create the required three material states:
// fresh wipe -> softer memory -> fully fogged glass. Both masks decay and are
// force-cleared after inactivity, so no residue can remain indefinitely.

export function initFog() {
  const canvas = document.getElementById('heroFog')
  const frost = document.getElementById('heroFrost')
  const hero = document.querySelector('.scene-hero')
  if (!canvas || !hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    canvas.style.display = 'none'
    hero.classList.add('fog-static')
    return
  }

  const ctx = canvas.getContext('2d')
  const freshBuffer = document.createElement('canvas')
  const freshCtx = freshBuffer.getContext('2d')
  const memoryBuffer = document.createElement('canvas')
  const memoryCtx = memoryBuffer.getContext('2d')
  const frostMask = document.createElement('canvas')
  const maskCtx = frostMask.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75)

  const MASK_SCALE = 0.2
  const BRUSH_MIN = 34
  const BRUSH_MAX = 94
  const FULL_RECOVERY_MS = 12500
  const hasBackdropMask =
    !!frost &&
    !!(window.CSS && CSS.supports) &&
    (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'))

  let W = 1
  let H = 1
  let cssW = 1
  let cssH = 1
  let maskW = 1
  let maskH = 1
  let baseMist = null
  let heroRect = hero.getBoundingClientRect()
  let pointer = { x: -1, y: -1, px: -1, py: -1, speed: 0 }
  let drops = []
  let raf = 0
  let running = false
  let tick = 0
  let lastMarkAt = 0
  let masksClear = true
  let environment = { humidity: 0.68, rain: 0.16, wind: 0.24, density: 0.62 }

  if (frost && !hasBackdropMask) frost.style.display = 'none'

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

  function refreshRect() {
    heroRect = hero.getBoundingClientRect()
  }

  function resize() {
    cssW = Math.max(1, hero.clientWidth)
    cssH = Math.max(1, hero.clientHeight)
    W = canvas.width = Math.max(1, Math.floor(cssW * dpr))
    H = canvas.height = Math.max(1, Math.floor(cssH * dpr))
    freshBuffer.width = memoryBuffer.width = W
    freshBuffer.height = memoryBuffer.height = H
    maskW = frostMask.width = Math.max(1, Math.round(cssW * MASK_SCALE))
    maskH = frostMask.height = Math.max(1, Math.round(cssH * MASK_SCALE))
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    baseMist = makeBaseMist()
    drops = []
    masksClear = true
    refreshRect()
  }

  function stamp(context, xCss, yCss, radiusCss, strength) {
    const x = xCss * dpr
    const y = yCss * dpr
    const radius = Math.max(1, radiusCss * dpr)
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(255,255,255,${strength})`)
    gradient.addColorStop(0.34, `rgba(255,255,255,${strength * 0.58})`)
    gradient.addColorStop(0.72, `rgba(255,255,255,${strength * 0.16})`)
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  function markGlass(x, y, radius, strength = 1) {
    stamp(memoryCtx, x, y, radius, 0.68 * strength)
    stamp(freshCtx, x, y, radius * 0.78, 0.9 * strength)
    lastMarkAt = performance.now()
    masksClear = false
  }

  function movePointer(event) {
    pointer.x = event.clientX - heroRect.left
    pointer.y = event.clientY - heroRect.top
  }

  hero.addEventListener('pointermove', movePointer, { passive: true })
  hero.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = pointer.px = pointer.py = -1
    pointer.speed = 0
  })

  function wipeByPointer() {
    if (pointer.x < 0 || pointer.y < 0 || pointer.x > cssW || pointer.y > cssH) return
    if (pointer.px < 0) {
      pointer.px = pointer.x
      pointer.py = pointer.y
      markGlass(pointer.x, pointer.y, 38, 0.58)
      return
    }

    const dx = pointer.x - pointer.px
    const dy = pointer.y - pointer.py
    const distance = Math.hypot(dx, dy)
    pointer.speed += (distance - pointer.speed) * 0.24
    if (distance > 0.55) {
      const radius = Math.min(BRUSH_MAX, BRUSH_MIN + pointer.speed * 0.88)
      const strength = Math.min(1, 0.56 + pointer.speed * 0.024)
      const steps = Math.min(20, Math.max(1, Math.ceil(distance / Math.max(16, radius * 0.3))))
      for (let i = 1; i <= steps; i++) {
        const progress = i / steps
        markGlass(pointer.px + dx * progress, pointer.py + dy * progress, radius, strength)
      }
    }

    pointer.px = pointer.x
    pointer.py = pointer.y
  }

  function maybeSpawnDrop(time) {
    const maxDrops = cssW < 700 ? 1 : 2
    if (drops.length >= maxDrops) return
    const chance = 0.00022 + environment.rain * 0.0016
    if (Math.random() > chance) return
    drops.push({
      x: cssW * (0.08 + Math.random() * 0.84),
      y: -40 - Math.random() * 100,
      previousY: -40,
      radius: 2.2 + Math.random() * 2.8,
      velocity: 0.42 + Math.random() * 0.62 + environment.rain * 0.24,
      wobble: Math.random() * Math.PI * 2,
      born: time,
      wait: 500 + Math.random() * 1800,
    })
  }

  function updateDrops(time) {
    maybeSpawnDrop(time)
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i]
      if (time - drop.born < drop.wait) continue
      drop.previousY = drop.y
      drop.velocity += 0.004 + environment.rain * 0.003
      drop.y += drop.velocity
      drop.wobble += 0.015 + environment.wind * 0.012
      drop.x += Math.sin(drop.wobble) * (0.08 + environment.wind * 0.16)

      const distance = Math.max(1, drop.y - drop.previousY)
      const steps = Math.ceil(distance / 2)
      for (let step = 0; step <= steps; step++) {
        const y = drop.previousY + distance * (step / Math.max(steps, 1))
        stamp(memoryCtx, drop.x, y, drop.radius * 0.86, 0.34)
        stamp(freshCtx, drop.x, y, drop.radius * 0.55, 0.54)
      }
      lastMarkAt = performance.now()
      masksClear = false
      if (drop.y > cssH + 50) drops.splice(i, 1)
    }
  }

  function fadeMask(context, alpha) {
    context.globalCompositeOperation = 'destination-out'
    context.fillStyle = `rgba(0,0,0,${alpha})`
    context.fillRect(0, 0, W, H)
    context.globalCompositeOperation = 'source-over'
  }

  function healMasks(time) {
    if (masksClear) return
    fadeMask(freshCtx, 0.02)
    fadeMask(memoryCtx, 0.0028)
    if (tick % 120 === 0) fadeMask(memoryCtx, 0.032)

    if (time - lastMarkAt > FULL_RECOVERY_MS && drops.length === 0) {
      freshCtx.clearRect(0, 0, W, H)
      memoryCtx.clearRect(0, 0, W, H)
      masksClear = true
    }
  }

  function updateFrostMask() {
    if (!hasBackdropMask || tick % 4 !== 0) return
    maskCtx.globalCompositeOperation = 'source-over'
    maskCtx.globalAlpha = 1
    maskCtx.fillStyle = '#fff'
    maskCtx.fillRect(0, 0, maskW, maskH)
    maskCtx.globalCompositeOperation = 'destination-out'
    maskCtx.globalAlpha = 0.72
    maskCtx.drawImage(memoryBuffer, 0, 0, maskW, maskH)
    maskCtx.globalAlpha = 1
    maskCtx.drawImage(freshBuffer, 0, 0, maskW, maskH)
    maskCtx.globalCompositeOperation = 'source-over'
    maskCtx.globalAlpha = 1
    const url = frostMask.toDataURL('image/png')
    frost.style.webkitMaskImage = `url(${url})`
    frost.style.maskImage = `url(${url})`
  }

  function frame(time = 0) {
    if (!running) return
    tick++
    wipeByPointer()
    updateDrops(time)
    healMasks(time)

    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.25 + environment.density * 0.17
    ctx.drawImage(baseMist, 0, 0)
    ctx.globalAlpha = 1

    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = 0.76
    ctx.drawImage(memoryBuffer, 0, 0)
    ctx.globalAlpha = 1
    ctx.drawImage(freshBuffer, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1

    updateFrostMask()
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (running) return
    running = true
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  window.addEventListener('ambientchange', (event) => {
    environment = { ...environment, ...(event.detail || {}) }
    baseMist = makeBaseMist()
  })

  const themeObserver = new MutationObserver(() => {
    baseMist = makeBaseMist()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(hero)
  window.addEventListener('scroll', refreshRect, { passive: true })

  const intersectionObserver = new IntersectionObserver((entries) => {
    entries[0]?.isIntersecting ? start() : stop()
  }, { threshold: 0.03 })
  intersectionObserver.observe(hero)

  resize()
  start()
}

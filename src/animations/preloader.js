// Preloader — 重返未来1999 Art Deco entrance
// Vintage film / antique book feel: rotating sunburst, clip-path T reveal,
// stepped loading bar, iris-wipe exit. ~2.5 seconds total.

export async function initPreloader(gsap) {
  const preloader = document.getElementById('preloader')
  if (!preloader) return

  const mark = preloader.querySelector('.preloader-mark')
  const fill = preloader.querySelector('.preloader-fill')
  const bar = preloader.querySelector('.preloader-bar')

  // ── Create Art Deco sunburst SVG ──
  const sunburst = document.createElement('div')
  sunburst.className = 'preloader-sunburst'
  sunburst.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 240px;
    height: 240px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  `
  sunburst.innerHTML = `
    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      ${Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 15) * Math.PI / 180
        const x1 = 120 + Math.cos(angle) * 40
        const y1 = 120 + Math.sin(angle) * 40
        const x2 = 120 + Math.cos(angle) * 110
        const y2 = 120 + Math.sin(angle) * 110
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(212,168,67,0.15)" stroke-width="0.5"/>`
      }).join('')}
      <circle cx="120" cy="120" r="40" stroke="rgba(212,168,67,0.2)" stroke-width="0.5" fill="none"/>
      <circle cx="120" cy="120" r="70" stroke="rgba(212,168,67,0.12)" stroke-width="0.5" fill="none"/>
      <circle cx="120" cy="120" r="100" stroke="rgba(212,168,67,0.08)" stroke-width="0.5" fill="none"/>
      <rect x="110" y="110" width="20" height="20" stroke="rgba(212,168,67,0.25)" stroke-width="0.5" fill="none" transform="rotate(45 120 120)"/>
    </svg>
  `
  preloader.appendChild(sunburst)

  // ── Create decorative corner ornaments ──
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  corners.forEach((pos) => {
    const corner = document.createElement('div')
    corner.className = `preloader-corner preloader-corner-${pos}`
    const isTop = pos.includes('top')
    const isLeft = pos.includes('left')
    corner.style.cssText = `
      position: absolute;
      ${isTop ? 'top' : 'bottom'}: 40px;
      ${isLeft ? 'left' : 'right'}: 40px;
      width: 32px;
      height: 32px;
      border-top: ${isTop ? '1px' : 'none'} solid rgba(212,168,67,0.3);
      border-bottom: ${!isTop ? '1px' : 'none'} solid rgba(212,168,67,0.3);
      border-left: ${isLeft ? '1px' : 'none'} solid rgba(212,168,67,0.3);
      border-right: ${!isLeft ? '1px' : 'none'} solid rgba(212,168,67,0.3);
      pointer-events: none;
      opacity: 0;
    `
    preloader.appendChild(corner)
  })

  // ── Sunburst rotation ──
  gsap.fromTo(
    sunburst,
    { rotation: 0, opacity: 0, scale: 0.6 },
    {
      rotation: 45,
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
    }
  )

  // ── Corner ornaments fade in ──
  gsap.to(preloader.querySelectorAll('[class^="preloader-corner"]'), {
    opacity: 1,
    stagger: 0.06,
    duration: 0.5,
    ease: 'power3.out',
    delay: 0.1,
  })

  // ── T mark — clip-path reveal from bottom ──
  if (mark) {
    gsap.fromTo(
      mark,
      {
        opacity: 0,
        clipPath: 'inset(100% 0% 0% 0%)',
        scale: 0.9,
      },
      {
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        duration: 0.8,
        ease: 'power4.out',
        delay: 0.15,
      }
    )
  }

  // ── Stepped loading bar fill ──
  // Race the rAF-driven tween against a wall-clock timeout so a stalled
  // ticker (backgrounded tab, slow device) can never block site init.
  if (fill) {
    const fillTween = gsap.to(fill, {
      width: '100%',
      duration: 1.6,
      ease: 'steps(12)',
      delay: 0.3,
    })
    await Promise.race([fillTween, new Promise((r) => setTimeout(r, 2400))])
  }

  // ── Sunburst spins out and fades ──
  gsap.to(sunburst, {
    rotation: 180,
    scale: 1.5,
    opacity: 0,
    duration: 0.5,
    ease: 'power3.in',
  })

  // ── Iris-wipe exit — circle clip-path from center ──
  // The preloader clips away as a shrinking circle centered on the T mark
  let hidden = false
  const hide = () => {
    if (hidden) return
    hidden = true
    preloader.style.display = 'none'
    sunburst.remove()
  }
  gsap.fromTo(
    preloader,
    {
      clipPath: 'circle(150% at 50% 50%)',
    },
    {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.7,
      ease: 'power4.inOut',
      delay: 0.05,
      onComplete: hide,
    }
  )

  // Guaranteed hide + unblock even if the iris-wipe rAF stalls.
  await new Promise((r) => setTimeout(r, 900))
  hide()
}

// Smooth scroll — Lenis + GSAP ScrollTrigger integration
// 重返未来1999 style: slower, more cinematic smooth scroll
// Duration 1.4, lerp 0.08, optional snap-to-section

import Lenis from 'lenis'

export function initScroll(ScrollTrigger) {
  const lenis = new Lenis({
    duration: 1.4,
    lerp: 0.08,
    smoothWheel: true,
    touchMultiplier: 1.5,
    overscroll: true,
  })

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // Use GSAP ticker for RAF
  import('gsap').then(({ default: gsap }) => {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
  })

  // Optional: snap to section behavior
  // Uncomment to enable section snapping
  /*
  const sections = document.querySelectorAll('.scene')
  lenis.on('scroll', ({ velocity }) => {
    if (Math.abs(velocity) < 0.5) return
    const scrollY = window.scrollY
    const vh = window.innerHeight
    let closest = null
    let closestDist = Infinity
    sections.forEach((section) => {
      const dist = Math.abs(section.offsetTop - scrollY)
      if (dist < closestDist) {
        closestDist = dist
        closest = section
      }
    })
    if (closest && closestDist > vh * 0.1 && closestDist < vh * 0.8) {
      lenis.scrollTo(closest, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3) })
    }
  })
  */

  return lenis
}

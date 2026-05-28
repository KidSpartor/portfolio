// Smooth scroll with Lenis + GSAP ScrollTrigger integration
import Lenis from 'lenis'

export function initScroll(ScrollTrigger) {
  const lenis = new Lenis({
    duration: 1.2,
    lerp: 0.1,
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

  return lenis
}

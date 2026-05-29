// Smooth scroll — Lenis + GSAP ScrollTrigger integration.
import Lenis from 'lenis'

export function initScroll(ScrollTrigger) {
  const lenis = new Lenis({
    duration: 1.1,
    lerp: 0.09,
    smoothWheel: true,
    touchMultiplier: 1.5,
  })

  lenis.on('scroll', ScrollTrigger.update)

  import('gsap').then(({ default: gsap }) => {
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  })

  return lenis
}

// Main entry point — Cinematic Studio
import './styles/main.css'
import { initScroll } from './animations/scroll.js'
import { initPreloader } from './animations/preloader.js'
import { initHero } from './animations/hero.js'
import { initShowcase } from './animations/showcase.js'
import { initStory } from './animations/story.js'
import { initReveals } from './animations/reveal.js'
import { initCanvas, initMagneticHover } from './animations/effects.js'
import { initAmbient } from './utils/ambient.js'
import { initNav } from './animations/nav.js'

// Wait for DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Register GSAP plugins
  const gsap = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.default.registerPlugin(ScrollTrigger)

  // Initialize smooth scroll
  const lenis = initScroll(ScrollTrigger)

  // Run preloader, then reveal
  await initPreloader(gsap.default)

  // Initialize all systems
  initNav()
  initHero(gsap.default, ScrollTrigger)
  initShowcase(gsap.default, ScrollTrigger, lenis)
  initStory(gsap.default, ScrollTrigger)
  initReveals(gsap.default, ScrollTrigger)
  initCanvas()
  initMagneticHover()
  initAmbient()
})

// Main entry point — 重返未来1999 Cinematic Studio
import './styles/main.css'
import { initScroll } from './animations/scroll.js'
import { initPreloader } from './animations/preloader.js'
import { initHero } from './animations/hero.js'
import { initShowcase } from './animations/showcase.js'
import { initStory } from './animations/story.js'
import { initReveals } from './animations/reveal.js'
import { initCanvas, initMagneticHover } from './animations/effects.js'
import { initAmbient } from './utils/ambient.js'
import { initAudio } from './utils/audio.js'
import { initNav } from './animations/nav.js'
import { initMotion } from './animations/motion.js'
import { initI18n } from './utils/i18n.js'

// Wait for DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Apply language BEFORE any text-splitting animation reads the hero title.
  initI18n()

  // Register GSAP plugins
  const gsap = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  const { SplitText } = await import('gsap/SplitText')
  gsap.default.registerPlugin(ScrollTrigger, SplitText)

  // Initialize smooth scroll
  const lenis = initScroll(ScrollTrigger)

  // Run preloader, then reveal
  await initPreloader(gsap.default)

  // Initialize all systems
  initNav(lenis)
  initHero(gsap.default, ScrollTrigger)
  initShowcase(gsap.default, ScrollTrigger, lenis)
  initStory(gsap.default, ScrollTrigger)
  initReveals(gsap.default, ScrollTrigger)
  initCanvas()
  initMagneticHover()
  initMotion(gsap.default, lenis)
  initAmbient()
  initAudio()
})

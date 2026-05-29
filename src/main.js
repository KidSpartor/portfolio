// Main entry — Kid Spartor, Builder
import './styles/main.css'
import { initScroll } from './animations/scroll.js'
import { initPreloader } from './animations/preloader.js'
import { initHero } from './animations/hero.js'
import { initShowcase } from './animations/showcase.js'
import { initStory } from './animations/story.js'
import { initReveals } from './animations/reveal.js'
import { initNav } from './animations/nav.js'
import { initMotion } from './animations/motion.js'
import { initDotField } from './animations/effects.js'
import { initI18n } from './utils/i18n.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Apply language BEFORE any text-splitting runs.
  initI18n()

  const gsap = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  const { SplitText } = await import('gsap/SplitText')
  gsap.default.registerPlugin(ScrollTrigger, SplitText)

  const lenis = initScroll(ScrollTrigger)
  initDotField()

  await initPreloader(gsap.default)

  initNav(gsap.default, ScrollTrigger, lenis)
  initHero(gsap.default, ScrollTrigger)
  initShowcase(gsap.default, ScrollTrigger, lenis)
  initStory(gsap.default, ScrollTrigger)
  initReveals(gsap.default, ScrollTrigger)
  initMotion(gsap.default, lenis)

  ScrollTrigger.refresh()
})

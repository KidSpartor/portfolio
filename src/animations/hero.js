// Hero — masked line/word reveal on load, then eyebrow/subtitle/principles cascade.
import { SplitText } from 'gsap/SplitText'

export function initHero(gsap, ScrollTrigger) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const title = document.querySelector('.hero-title')
  const eyebrow = document.querySelector('.hero-eyebrow')
  const subtitle = document.querySelector('.hero-subtitle')
  const principles = document.querySelectorAll('.hero-principles li')
  const cue = document.querySelector('.hero-scroll-cue')
  const meta = document.querySelector('.hero-meta')

  if (reduced) return

  gsap.set([eyebrow, subtitle, cue, meta], { opacity: 0, y: 24 })
  gsap.set(principles, { opacity: 0, y: 24 })

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

  if (title) {
    const split = new SplitText(title, { type: 'lines,words', linesClass: 'split-line' })
    gsap.set(split.words, { yPercent: 118, opacity: 0 })
    tl.to(split.words, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.06 })
  }

  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
    .to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to(principles, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')
    .to([cue, meta], { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
}

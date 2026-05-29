// Story — statement words brighten from dim to full as the section scrolls past.
import { SplitText } from 'gsap/SplitText'

export function initStory(gsap, ScrollTrigger) {
  const statement = document.querySelector('.story-statement')
  if (!statement) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  const split = new SplitText(statement, { type: 'words', wordsClass: 'word' })
  gsap.set(split.words, { opacity: 0.14 })
  gsap.to(split.words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.5,
    scrollTrigger: {
      trigger: statement,
      start: 'top 78%',
      end: 'bottom 62%',
      scrub: true,
    },
  })
}

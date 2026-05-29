// Scroll reveals — section titles split into masked lines; [data-reveal] blocks fade up.
import { SplitText } from 'gsap/SplitText'

export function initReveals(gsap, ScrollTrigger) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Section / contact titles — masked line reveal on enter (hero handled separately).
  document.querySelectorAll('[data-split]:not(.hero-title)').forEach((el) => {
    if (reduced) return
    const split = new SplitText(el, { type: 'lines,words', linesClass: 'split-line' })
    gsap.set(split.words, { yPercent: 118, opacity: 0 })
    gsap.to(split.words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.95,
      ease: 'power4.out',
      stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    })
  })

  // Section eyebrow labels + descriptions — soft fade up.
  document.querySelectorAll('.section-head .mono-label, .section-desc').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    )
  })

  // Generic [data-reveal] blocks.
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    )
  })
}

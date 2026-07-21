export function initHero(gsap, ScrollTrigger, SplitText) {
  const hero = document.querySelector('.scene-hero')
  if (!hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const letterbox = document.querySelectorAll('.letterbox')
  const eyebrow = hero.querySelector('.hero-eyebrow')
  const titleLines = [...hero.querySelectorAll('.hero-title-line')]
  const subtitle = hero.querySelector('.hero-subtitle')
  const statements = [...hero.querySelectorAll('.hero-mode')]
  const scrollCue = hero.querySelector('.hero-scroll-cue')
  const heroContent = hero.querySelector('.hero-content')
  const counter = hero.querySelector('.hero-counter')

  if (reduced) {
    gsap.set(letterbox, { height: 0 })
    gsap.set([hero, eyebrow, subtitle, scrollCue, ...titleLines, ...statements], {
      opacity: 1,
      x: 0,
      y: 0,
      clearProps: 'transform,clip-path',
    })
    return
  }

  const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } })
  timeline.fromTo(hero, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: 'power2.out' })

  const eyebrowLabel = eyebrow?.querySelector('.mono-label')
  if (eyebrowLabel) {
    const eyebrowSplit = SplitText.create(eyebrowLabel, {
      type: 'chars',
      charsClass: 'hero-eyebrow-char',
    })
    timeline.fromTo(
      eyebrowSplit.chars,
      { opacity: 0 },
      { opacity: 1, duration: 0.025, stagger: 0.025, ease: 'none' },
      0.12
    )
  }

  const titleChars = titleLines.flatMap((line) => {
    const split = SplitText.create(line, {
      type: 'chars,words',
      charsClass: 'hero-char',
      wordsClass: 'hero-word',
    })
    return split.chars
  })

  timeline.fromTo(
    titleChars,
    { opacity: 0, yPercent: 115, rotateX: -12 },
    {
      opacity: 1,
      yPercent: 0,
      rotateX: 0,
      duration: 0.65,
      stagger: 0.018,
    },
    0.28
  )

  if (subtitle) {
    timeline.fromTo(subtitle, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.25')
  }

  if (statements.length) {
    timeline.fromTo(
      statements,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.62, stagger: 0.09 },
      '-=0.35'
    )
  }

  if (scrollCue) {
    timeline.fromTo(scrollCue, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
  }

  if (letterbox.length) {
    gsap.to(letterbox, {
      height: 0,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=40%',
        scrub: 1,
      },
    })
  }

  if (heroContent) {
    gsap.to(heroContent, {
      y: -80,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }

  if (counter) {
    gsap.to(counter, {
      opacity: 0,
      scrollTrigger: {
        trigger: hero,
        start: '30% top',
        end: '60% top',
        scrub: 1,
      },
    })
  }
}

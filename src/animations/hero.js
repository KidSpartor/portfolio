// Hero scene — cinematic entrance with letterbox opening and text reveal
export function initHero(gsap, ScrollTrigger) {
  const hero = document.querySelector('.scene-hero')
  if (!hero) return

  // Letterbox bars open on scroll
  const letterboxTop = document.querySelector('.letterbox-top')
  const letterboxBottom = document.querySelector('.letterbox-bottom')

  if (letterboxTop && letterboxBottom) {
    gsap.to([letterboxTop, letterboxBottom], {
      height: '0vh',
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=40%',
        scrub: 1,
      },
    })
  }

  // Hero title lines — staggered reveal
  const titleLines = hero.querySelectorAll('.hero-title-line')
  gsap.from(titleLines, {
    y: 120,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power4.out',
    delay: 0.3,
  })

  // Eyebrow
  const eyebrow = hero.querySelector('.hero-eyebrow')
  if (eyebrow) {
    gsap.from(eyebrow, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1,
    })
  }

  // Subtitle
  const subtitle = hero.querySelector('.hero-subtitle')
  if (subtitle) {
    gsap.from(subtitle, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.8,
    })
  }

  // Hero statements
  const statements = hero.querySelectorAll('.hero-statement')
  if (statements.length) {
    gsap.from(statements, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 1.0,
    })
  }

  // Scroll cue
  const scrollCue = hero.querySelector('.hero-scroll-cue')
  if (scrollCue) {
    gsap.from(scrollCue, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 1.2,
    })
  }

  // Hero parallax on scroll — title fades and moves up
  gsap.to(hero.querySelector('.hero-content'), {
    y: -100,
    opacity: 0.3,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  })

  // Counter fade
  const counter = hero.querySelector('.hero-counter')
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

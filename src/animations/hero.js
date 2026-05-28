// Hero scene — cinematic entrance with letterbox opening, text reveal, variable font animation
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

  // Hero title lines — staggered clip-path reveal
  const titleLines = hero.querySelectorAll('.hero-title-line')
  titleLines.forEach((line, i) => {
    gsap.fromTo(
      line,
      {
        y: 80,
        opacity: 0,
        clipPath: 'inset(0% 0% 100% 0%)',
      },
      {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.3 + i * 0.15,
      }
    )
  })

  // Eyebrow — slide in from left
  const eyebrow = hero.querySelector('.hero-eyebrow')
  if (eyebrow) {
    gsap.from(eyebrow, {
      x: -40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1,
    })
  }

  // Subtitle — fade up
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

  // Hero statements — staggered with clip-path
  const statements = hero.querySelectorAll('.hero-statement')
  if (statements.length) {
    statements.forEach((stmt, i) => {
      gsap.fromTo(
        stmt,
        {
          y: 30,
          opacity: 0,
          clipPath: 'inset(0% 100% 0% 0%)',
        },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.8,
          ease: 'power4.out',
          delay: 1.0 + i * 0.12,
        }
      )
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

  // Variable font weight animation on scroll — Inter supports wght 300-700
  const heroTitle = hero.querySelector('.hero-title')
  if (heroTitle) {
    // Only apply if font supports variation
    gsap.to(heroTitle, {
      fontVariationSettings: '"wght" 700',
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '50% top',
        scrub: 1,
      },
    })
  }

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

  // Scene entrance — hero fades in with a cinematic reveal
  gsap.fromTo(
    hero,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: 0.1,
    }
  )
}

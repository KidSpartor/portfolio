// Showcase — horizontal scroll gallery with enhanced card animations
export function initShowcase(gsap, ScrollTrigger, lenis) {
  const section = document.querySelector('.scene-work')
  const track = document.getElementById('showcaseTrack')
  if (!section || !track) return

  const cards = track.querySelectorAll('.showcase-card')
  if (cards.length === 0) return

  // Calculate total scroll distance
  const getScrollAmount = () => {
    const trackWidth = track.scrollWidth
    const viewportWidth = window.innerWidth
    return -(trackWidth - viewportWidth + 100)
  }

  // Main horizontal scroll tween
  const tween = gsap.to(track, {
    x: getScrollAmount,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.abs(getScrollAmount())}`,
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })

  // Card entrance animations — clip-path reveal + scale
  cards.forEach((card, i) => {
    // Clip-path reveal from bottom
    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 60,
        clipPath: 'inset(100% 5% 0% 5%)',
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: 'left 90%',
          end: 'left 60%',
          scrub: 1,
        },
      }
    )

    // Card number — slides in from right
    const number = card.querySelector('.card-number')
    if (number) {
      gsap.fromTo(
        number,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            containerAnimation: tween,
            start: 'left 80%',
            end: 'left 65%',
            scrub: 1,
          },
        }
      )
    }

    // Tag row — staggered fade in
    const tags = card.querySelectorAll('.tag')
    if (tags.length) {
      gsap.fromTo(
        tags,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            containerAnimation: tween,
            start: 'left 70%',
            end: 'left 55%',
            scrub: 1,
          },
        }
      )
    }
  })

  // Section header entrance
  const header = section.querySelector('.scene-header')
  if (header) {
    const label = header.querySelector('.mono-label')
    const title = header.querySelector('.section-title')
    const desc = header.querySelector('.section-desc')

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })

    if (label) {
      tl.from(label, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
    }
    if (title) {
      tl.from(title, {
        y: 40,
        opacity: 0,
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.9,
        ease: 'power4.out',
      }, '-=0.3')
    }
    if (desc) {
      tl.from(desc, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    }
  }

  // Refresh on resize
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200)
  })
}

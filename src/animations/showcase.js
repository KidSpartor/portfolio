// Showcase — 重返未来1999 horizontal scroll gallery
// Cards clip-path reveal from bottom with scale, card numbers typewriter,
// tags stagger from below, decorative gold line draws across track,
// section header clip-path from bottom.

export function initShowcase(gsap, ScrollTrigger, lenis) {
  const section = document.querySelector('.scene-work')
  const track = document.getElementById('showcaseTrack')
  if (!section || !track) return

  const cards = track.querySelectorAll('.showcase-card')
  if (cards.length === 0) return

  // ── Calculate total scroll distance ──
  const getScrollAmount = () => {
    const trackWidth = track.scrollWidth
    const viewportWidth = window.innerWidth
    return -(trackWidth - viewportWidth + 100)
  }

  // ── Main horizontal scroll tween ──
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

  // ── Create decorative gold line that draws across track top ──
  const goldLine = document.createElement('div')
  goldLine.className = 'showcase-gold-line'
  goldLine.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,168,67,0.4), rgba(232,197,71,0.6), rgba(212,168,67,0.4), transparent);
    transform-origin: left center;
    transform: scaleX(0);
    pointer-events: none;
    z-index: 5;
  `
  track.style.position = 'relative'
  track.appendChild(goldLine)

  // Gold line draws as user scrolls horizontally
  gsap.to(goldLine, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.abs(getScrollAmount())}`,
      scrub: 1,
    },
  })

  // ── Card entrance animations ──
  cards.forEach((card, i) => {
    // Clip-path reveal from bottom with scale
    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 80,
        clipPath: 'inset(100% 5% 0% 5%)',
        scale: 0.92,
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

    // Card number — typewriter effect
    const number = card.querySelector('.card-number')
    if (number) {
      const numText = number.textContent
      number.textContent = ''
      number.style.opacity = '0'

      // Create character spans
      const numChars = numText.split('').map((char) => {
        const span = document.createElement('span')
        span.textContent = char
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        number.appendChild(span)
        return span
      })

      // Typewriter reveal on scroll
      gsap.to(number, {
        opacity: 1,
        duration: 0.01,
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: 'left 80%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(numChars, {
        opacity: 1,
        duration: 0.04,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: 'left 80%',
          toggleActions: 'play none none none',
        },
      })
    }

    // Tags — stagger in from below
    const tags = card.querySelectorAll('.tag')
    if (tags.length) {
      gsap.fromTo(
        tags,
        { opacity: 0, y: 20 },
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

  // ── Section header — clip-path reveal from bottom ──
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
      tl.fromTo(
        label,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        }
      )
    }

    if (title) {
      tl.fromTo(
        title,
        {
          y: 50,
          opacity: 0,
          clipPath: 'inset(0% 0% 100% 0%)',
        },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.9,
          ease: 'power4.out',
        },
        '-=0.3'
      )
    }

    if (desc) {
      tl.fromTo(
        desc,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
        },
        '-=0.4'
      )
    }
  }

  // ── Refresh on resize ──
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200)
  })
}

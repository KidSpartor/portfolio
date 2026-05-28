// Showcase — horizontal scroll gallery for work cards
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

  // Card entrance animations within the horizontal scroll
  // Using gsap.fromTo for containerAnimation compatibility
  cards.forEach((card, i) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: 'left 90%',
          end: 'left 60%',
          scrub: 1,
        },
      }
    )
  })

  // Refresh on resize
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200)
  })
}

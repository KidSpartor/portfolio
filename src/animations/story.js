// Story scene — pinned section with scroll-driven text reveals
export function initStory(gsap, ScrollTrigger) {
  const section = document.querySelector('.scene-story')
  const pin = document.getElementById('storyPin')
  if (!section || !pin) return

  const blocks = section.querySelectorAll('[data-story]')
  const bgText = section.querySelector('.story-bg-text')

  // Pin the story section
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom-=30% top',
    pin: pin,
    scrub: 1,
  })

  // Background text parallax
  if (bgText) {
    gsap.to(bgText, {
      x: '-20%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }

  // Staggered block reveals within the pinned section
  blocks.forEach((block, i) => {
    gsap.fromTo(
      block,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: `${i * 15}% top`,
          end: `${(i + 1) * 15 + 10}% top`,
          scrub: 1,
        },
      }
    )
  })

  // Principle cards stagger
  const principles = section.querySelectorAll('.principle')
  principles.forEach((p, i) => {
    gsap.fromTo(
      p,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: `${50 + i * 12}% top`,
          toggleActions: 'play none none none',
        },
      }
    )
  })
}

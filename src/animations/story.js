// Story scene — pinned section with cinematic text reveals and Art Deco styling
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

  // Background text parallax — slower, more cinematic
  if (bgText) {
    gsap.to(bgText, {
      x: '-25%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    // Background text opacity pulse
    gsap.fromTo(
      bgText,
      { opacity: 0.15 },
      {
        opacity: 0.4,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '30% top',
          scrub: 1,
        },
      }
    )
  }

  // Staggered block reveals with clip-path
  blocks.forEach((block, i) => {
    gsap.fromTo(
      block,
      {
        opacity: 0,
        y: 60,
        clipPath: 'inset(100% 0% 0% 0%)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: section,
          start: `${i * 15}% top`,
          end: `${(i + 1) * 15 + 10}% top`,
          scrub: 1,
        },
      }
    )
  })

  // Principle cards — stagger from left with enhanced motion
  const principles = section.querySelectorAll('.principle')
  principles.forEach((p, i) => {
    const num = p.querySelector('.principle-num')

    gsap.fromTo(
      p,
      {
        opacity: 0,
        x: -40,
        clipPath: 'inset(0% 100% 0% 0%)',
      },
      {
        opacity: 1,
        x: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: section,
          start: `${50 + i * 12}% top`,
          toggleActions: 'play none none none',
        },
      }
    )

    // Principle number — scale in
    if (num) {
      gsap.fromTo(
        num,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: section,
            start: `${52 + i * 12}% top`,
            toggleActions: 'play none none none',
          },
        }
      )
    }
  })

  // Bio text — variable font weight animation
  const bioText = section.querySelector('.bio-text')
  if (bioText) {
    gsap.fromTo(
      bioText,
      { fontVariationSettings: '"wght" 300' },
      {
        fontVariationSettings: '"wght" 500',
        scrollTrigger: {
          trigger: section,
          start: '20% top',
          end: '50% top',
          scrub: 1,
        },
      }
    )
  }

  // Story border — fade in as section enters
  const border = pin.querySelector('::before')
  gsap.fromTo(
    pin,
    { '--border-opacity': '0' },
    {
      '--border-opacity': '0.3',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      },
    }
  )
}

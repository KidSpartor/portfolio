// General reveal animations — clip-path reveals, staggered entrances, section headers
export function initReveals(gsap, ScrollTrigger) {
  // Desk cards, note cards, contact panels — clip-path reveal
  const revealElements = document.querySelectorAll('[data-reveal]')

  revealElements.forEach((el, i) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 50,
        clipPath: 'inset(100% 0% 0% 0%)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  // Section headers — cinematic timeline reveal
  const headers = document.querySelectorAll('.scene-header')
  headers.forEach((header) => {
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
      tl.from(label, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
    }

    if (title) {
      tl.from(
        title,
        {
          y: 40,
          opacity: 0,
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.9,
          ease: 'power4.out',
        },
        '-=0.3'
      )
    }

    if (desc) {
      tl.from(
        desc,
        {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
        '-=0.4'
      )
    }
  })

  // Contact scene — cinematic entrance
  const contactMain = document.querySelector('.contact-main')
  if (contactMain) {
    gsap.from(contactMain, {
      opacity: 0,
      y: 40,
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: contactMain,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  }

  // Contact panels — staggered clip-path reveals
  const contactPanels = document.querySelectorAll('.contact-panel')
  contactPanels.forEach((panel, i) => {
    gsap.fromTo(
      panel,
      {
        opacity: 0,
        x: 40,
        clipPath: 'inset(0% 100% 0% 0%)',
      },
      {
        opacity: 1,
        x: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        ease: 'power4.out',
        delay: 0.2 + i * 0.15,
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  // Note card number reveal
  const noteNums = document.querySelectorAll('.note-num')
  noteNums.forEach((num) => {
    gsap.from(num, {
      opacity: 0,
      x: -20,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: num.closest('.note-card'),
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  })

  // Section divider line reveal
  const scenes = document.querySelectorAll('.scene:not(.scene-hero):not(.scene-story)')
  scenes.forEach((scene) => {
    const line = scene.querySelector('::after')
    gsap.fromTo(
      scene,
      { '--line-scale': '0%' },
      {
        '--line-scale': '100%',
        scrollTrigger: {
          trigger: scene,
          start: 'bottom 90%',
          end: 'bottom 60%',
          scrub: 1,
        },
      }
    )
  })
}

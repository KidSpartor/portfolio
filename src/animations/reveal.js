// General reveal animations for elements with data-reveal attribute
export function initReveals(gsap, ScrollTrigger) {
  // Desk cards, note cards, contact panels
  const revealElements = document.querySelectorAll('[data-reveal]')

  revealElements.forEach((el, i) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  // Section headers
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
          duration: 0.8,
          ease: 'power3.out',
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

  // Contact scene
  const contactMain = document.querySelector('.contact-main')
  if (contactMain) {
    gsap.from(contactMain, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: contactMain,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  }
}

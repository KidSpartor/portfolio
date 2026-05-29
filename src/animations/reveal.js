// General reveals — 重返未来1999 style
// [data-reveal] clip-path from bottom with Y translation,
// section headers: label slides from left, title clip-path from bottom, desc fades up,
// contact main clip-path from bottom, contact panels clip-path from right staggered,
// note numbers fade from left, desk icons scale in with back.out(2).

export function initReveals(gsap, ScrollTrigger) {
  // ── [data-reveal] elements — clip-path from bottom with Y translation ──
  const revealElements = document.querySelectorAll('[data-reveal]')

  revealElements.forEach((el, i) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 50,
        clipPath: 'inset(100% 0% 0% 0%)',
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        filter: 'blur(0px)',
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

  // ── Section headers — cinematic timeline reveal ──
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

    // Label slides in from left
    if (label) {
      tl.fromTo(
        label,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        }
      )
    }

    // Title clip-path reveals from bottom
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

    // Description fades up
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
  })

  // ── Contact main — clip-path reveal from bottom ──
  const contactMain = document.querySelector('.contact-main')
  if (contactMain) {
    gsap.fromTo(
      contactMain,
      {
        opacity: 0,
        y: 50,
        clipPath: 'inset(0% 0% 100% 0%)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: contactMain,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }

  // ── Contact panels — clip-path from right, staggered ──
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
        delay: 0.15 + i * 0.15,
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  // ── Note numbers — fade in from left ──
  const noteNums = document.querySelectorAll('.note-num')
  noteNums.forEach((num) => {
    gsap.fromTo(
      num,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: num.closest('.note-card'),
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  // ── Desk icons — scale in with back.out(2) easing ──
  const deskIcons = document.querySelectorAll('.desk-icon')
  deskIcons.forEach((icon) => {
    gsap.fromTo(
      icon,
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: icon.closest('.desk-card'),
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  // ── Section divider line reveal ──
  const scenes = document.querySelectorAll('.scene:not(.scene-hero):not(.scene-story)')
  scenes.forEach((scene) => {
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

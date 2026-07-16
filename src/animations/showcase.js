import EmblaCarousel from 'embla-carousel'

export function initShowcase(gsap, ScrollTrigger) {
  const section = document.querySelector('.scene-work')
  const viewport = document.getElementById('showcaseViewport')
  const track = document.getElementById('showcaseTrack')
  const previous = document.getElementById('showcasePrev')
  const next = document.getElementById('showcaseNext')
  const position = document.getElementById('showcasePosition')
  const railFill = document.getElementById('showcaseRailFill')
  if (!section || !viewport || !track || !previous || !next) return

  const cards = [...track.querySelectorAll('.showcase-card')]
  if (!cards.length) return

  viewport.setAttribute('role', 'region')
  viewport.setAttribute('aria-roledescription', 'carousel')
  cards.forEach((card, index) => {
    card.setAttribute('role', 'group')
    card.setAttribute('aria-roledescription', 'slide')
    card.setAttribute('aria-label', `${index + 1} of ${cards.length}`)
  })

  const embla = EmblaCarousel(viewport, {
    align: 'start',
    containScroll: 'keepSnaps',
    loop: false,
    skipSnaps: false,
  })

  const updateControls = () => {
    const selected = embla.selectedScrollSnap()
    const snaps = embla.scrollSnapList().length
    previous.disabled = !embla.canScrollPrev()
    next.disabled = !embla.canScrollNext()
    if (position) position.textContent = `${selected + 1} / ${snaps}`
    if (railFill) {
      const progress = (selected + 1) / snaps
      railFill.style.transform = `scaleX(${progress})`
    }
  }

  previous.addEventListener('click', () => embla.scrollPrev())
  next.addEventListener('click', () => embla.scrollNext())
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      embla.scrollPrev()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      embla.scrollNext()
    }
  })

  embla.on('select', updateControls)
  embla.on('reInit', updateControls)
  updateControls()

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const header = section.querySelector('.scene-header')

  if (reduced) {
    gsap.set([header, ...cards], { clearProps: 'all', opacity: 1 })
    return
  }

  if (header) {
    const label = header.querySelector('.mono-label')
    const title = header.querySelector('.section-title')
    const description = header.querySelector('.section-desc')
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    })

    if (label) timeline.fromTo(label, { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
    if (title) timeline.fromTo(title, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }, '-=0.2')
    if (description) timeline.fromTo(description, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.35')
  }

  gsap.fromTo(
    cards,
    { opacity: 0, y: 54 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: viewport,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    }
  )

  const goldLine = document.createElement('div')
  goldLine.className = 'showcase-gold-line'
  section.appendChild(goldLine)
  gsap.fromTo(goldLine, { scaleX: 0 }, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top 72%',
      end: 'bottom 65%',
      scrub: 1,
    },
  })

  requestAnimationFrame(() => ScrollTrigger.refresh())
}

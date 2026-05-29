// Showcase — 重返未来1999 horizontal gallery
// Native horizontal scroller (drag / trackpad-swipe / arrows) that does NOT
// hijack vertical page scroll. Cards reveal on normal vertical scroll; a gold
// progress rail and a "scroll" hint track horizontal position.

export function initShowcase(gsap, ScrollTrigger, lenis) {
  const section = document.querySelector('.scene-work')
  const track = document.getElementById('showcaseTrack')
  if (!section || !track) return

  const cards = track.querySelectorAll('.showcase-card')
  if (cards.length === 0) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Section header reveal ──
  const header = section.querySelector('.scene-header')
  if (header) {
    const label = header.querySelector('.mono-label')
    const title = header.querySelector('.section-title')
    const desc = header.querySelector('.section-desc')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: header, start: 'top 80%', toggleActions: 'play none none none' },
    })
    if (label) tl.fromTo(label, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
    if (title) tl.fromTo(title, { y: 50, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power4.out' }, '-=0.3')
    if (desc) tl.fromTo(desc, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.4')
  }

  // ── Card entrance on normal vertical scroll ──
  cards.forEach((card) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 70, clipPath: 'inset(12% 6% 0% 6%)', scale: 0.96 },
      {
        opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', scale: 1,
        duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: track, start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  })

  // ── Controls: gold progress rail + "scroll" hint ──
  const controls = document.createElement('div')
  controls.className = 'showcase-controls'
  controls.innerHTML = `
    <div class="showcase-rail"><span class="showcase-rail-fill"></span></div>
    <div class="showcase-hint"><span class="showcase-hint-text">drag</span><span class="showcase-hint-arrow">↔</span></div>`
  track.insertAdjacentElement('afterend', controls)
  const railFill = controls.querySelector('.showcase-rail-fill')
  const hint = controls.querySelector('.showcase-hint')

  const maxScroll = () => track.scrollWidth - track.clientWidth
  const updateProgress = () => {
    const max = maxScroll()
    const p = max > 0 ? track.scrollLeft / max : 0
    railFill.style.transform = `scaleX(${p})`
    if (track.scrollLeft > 8) hint.classList.add('is-hidden')
    else hint.classList.remove('is-hidden')
  }

  // Hide controls entirely if there's nothing to scroll
  const syncControls = () => {
    controls.style.display = maxScroll() > 4 ? '' : 'none'
    updateProgress()
  }

  track.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', () => {
    syncControls()
    ScrollTrigger.refresh()
  })
  // Initial sync (after layout/fonts settle)
  requestAnimationFrame(syncControls)
  setTimeout(syncControls, 400)

  // ── Click-drag to scroll (desktop pointer) ──
  let down = false
  let startX = 0
  let startScroll = 0
  let moved = 0

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return // let native touch scroll handle it
    down = true
    moved = 0
    startX = e.clientX
    startScroll = track.scrollLeft
    track.classList.add('is-dragging')
  })
  track.addEventListener('pointermove', (e) => {
    if (!down) return
    const dx = e.clientX - startX
    moved = Math.abs(dx)
    track.scrollLeft = startScroll - dx
  })
  const endDrag = () => {
    if (!down) return
    down = false
    track.classList.remove('is-dragging')
  }
  track.addEventListener('pointerup', endDrag)
  track.addEventListener('pointerleave', endDrag)
  track.addEventListener('pointercancel', endDrag)

  // Suppress the click that follows a real drag (so cards aren't opened by accident)
  track.addEventListener(
    'click',
    (e) => {
      if (moved > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    true
  )

  // ── Gold draw-line across the track top, tied to scroll position ──
  if (!reduced) {
    const goldLine = document.createElement('div')
    goldLine.className = 'showcase-gold-line'
    goldLine.style.cssText = `
      position:absolute; top:0; left:0; width:100%; height:1px;
      background:linear-gradient(90deg, transparent, rgba(212,168,67,0.4), rgba(232,197,71,0.6), rgba(212,168,67,0.4), transparent);
      transform-origin:left center; transform:scaleX(0); pointer-events:none; z-index:5;`
    section.style.position = 'relative'
    section.appendChild(goldLine)
    gsap.fromTo(
      goldLine,
      { scaleX: 0 },
      {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top 70%', end: 'bottom 60%', scrub: 1 },
      }
    )
  }
}

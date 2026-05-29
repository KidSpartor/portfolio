// Work gallery — native horizontal scroller (drag / swipe / scrollbar) that does
// NOT hijack vertical page scroll. Cards reveal on vertical scroll; a progress
// rail + "drag" hint track horizontal position.
export function initShowcase(gsap, ScrollTrigger, lenis) {
  const section = document.querySelector('.section-work')
  const track = document.getElementById('showcaseTrack')
  if (!section || !track) return

  const cards = track.querySelectorAll('.showcase-card')
  if (cards.length === 0) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Card entrance on vertical scroll ──
  if (!reduced) {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.1,
        scrollTrigger: { trigger: track, start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }

  // ── Controls: progress rail + "drag" hint ──
  const controls = document.createElement('div')
  controls.className = 'showcase-controls'
  controls.innerHTML = `
    <div class="showcase-rail"><span class="showcase-rail-fill"></span></div>
    <div class="showcase-hint"><span class="showcase-hint-text">drag</span><span class="showcase-hint-arrow">→</span></div>`
  track.insertAdjacentElement('afterend', controls)
  const railFill = controls.querySelector('.showcase-rail-fill')
  const hint = controls.querySelector('.showcase-hint')

  const maxScroll = () => track.scrollWidth - track.clientWidth
  const updateProgress = () => {
    const max = maxScroll()
    const p = max > 0 ? track.scrollLeft / max : 0
    railFill.style.transform = `scaleX(${p})`
    hint.classList.toggle('is-hidden', track.scrollLeft > 8)
  }

  const syncControls = () => {
    controls.style.display = maxScroll() > 4 ? '' : 'none'
    updateProgress()
  }

  track.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', () => {
    syncControls()
    ScrollTrigger.refresh()
  })
  requestAnimationFrame(syncControls)
  setTimeout(syncControls, 400)

  // ── Click-drag to scroll (desktop pointer) ──
  let down = false
  let startX = 0
  let startScroll = 0
  let moved = 0

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return
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

  // Suppress the click that follows a real drag.
  track.addEventListener('click', (e) => {
    if (moved > 6) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, true)
}

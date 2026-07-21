// Motion enrichment — 重返未来1999
// Premium interaction layer: magnetic controls, scroll-velocity skew on
// content blocks, and film grain that breathes with
// scroll speed. All effects are desktop-only / reduced-motion aware and purely
// additive — they never touch the ScrollTrigger-driven scene layouts.

export function initMotion(gsap, lenis) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(pointer: fine)').matches

  // ── Magnetic controls — pull toward the pointer ──
  if (fine && !reduced) {
    const magnets = document.querySelectorAll('.nav-btn, .contact-link, [data-magnetic]')
    magnets.forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
      const strength = el.classList.contains('contact-link') ? 0.25 : 0.4
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * strength)
        yTo((e.clientY - (r.top + r.height / 2)) * strength)
      })
      el.addEventListener('mouseleave', () => {
        xTo(0)
        yTo(0)
      })
    })
  }

  // ── Scroll-velocity skew + grain breathing ──
  if (!reduced && lenis) {
    const skewEls = document.querySelectorAll('.desk-grid, .notes-track, .story-principles, .showcase-track')
    const skewSetters = [...skewEls]
      // never skew the horizontal track (its transform is owned by ScrollTrigger)
      .filter((el) => !el.classList.contains('showcase-track'))
      .map((el) => gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }))

    const grain = document.querySelector('.grain')
    const grainBase = grain ? parseFloat(getComputedStyle(grain).opacity) || 0.04 : 0
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

    lenis.on('scroll', ({ velocity }) => {
      const v = velocity || 0
      const sk = clamp(v * 0.18, -4, 4)
      skewSetters.forEach((s) => s(sk))
      if (grain) grain.style.opacity = String(clamp(grainBase + Math.abs(v) * 0.004, grainBase, 0.12))
    })
  }
}

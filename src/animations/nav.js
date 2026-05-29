// Nav + chrome — scrolled state, scroll-progress bar, anchor smooth-scroll,
// theme toggle, and the fixed mono HUD readout (section / scroll % / time).
export function initNav(gsap, ScrollTrigger, lenis) {
  const nav = document.getElementById('nav')
  const bar = document.getElementById('scrollProgress')
  const hudSection = document.getElementById('hudSection')
  const hudScroll = document.getElementById('hudScroll')
  const hudTime = document.getElementById('hudTime')

  const sections = [...document.querySelectorAll('section[id]')]

  const update = () => {
    const y = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? y / max : 0

    if (nav) nav.classList.toggle('is-scrolled', y > 24)
    if (bar) bar.style.transform = `scaleX(${p})`
    if (hudScroll) hudScroll.textContent = String(Math.round(p * 100)).padStart(3, '0')

    if (hudSection) {
      const mid = y + window.innerHeight * 0.4
      let current = sections[0]
      for (const s of sections) {
        if (s.offsetTop <= mid) current = s
      }
      if (current) hudSection.textContent = current.id.toUpperCase()
    }
  }

  if (lenis) lenis.on('scroll', update)
  window.addEventListener('scroll', update, { passive: true })
  update()

  // Anchor links → Lenis smooth scroll.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target, { offset: -10, duration: 1.1 })
      else target.scrollIntoView({ behavior: 'smooth' })
    })
  })

  // Theme toggle.
  const themeToggle = document.getElementById('themeToggle')
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement
      const next = root.dataset.theme === 'light' ? 'dark' : 'light'
      root.dataset.theme = next
      try { localStorage.setItem('theme', next) } catch (e) { /* ignore */ }
      ScrollTrigger.refresh()
    })
  }

  // HUD clock.
  if (hudTime) {
    const tick = () => {
      hudTime.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false })
    }
    tick()
    setInterval(tick, 1000)
  }
}

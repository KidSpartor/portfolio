// Navigation — scroll-aware background, active section tracking, progress bar
export function initNav(lenis) {
  const nav = document.getElementById('nav')
  const progressBar = document.getElementById('scrollProgress')
  if (!nav) return

  // Scroll-aware glass background + progress bar
  const onScroll = () => {
    const y = window.scrollY
    nav.classList.toggle('scrolled', y > 80)

    // Progress bar
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (y / docHeight) * 100 : 0
      progressBar.style.width = `${Math.min(progress, 100)}%`
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // Active section tracking via IntersectionObserver
  const links = [...nav.querySelectorAll('.nav-links a')]
  const sectionIds = links.map((a) => a.getAttribute('href').slice(1))
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const id = entry.target.id
        links.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
        })
      })
    },
    { rootMargin: '-40% 0px -50% 0px' }
  )

  sections.forEach((s) => observer.observe(s))

  // Theme toggle
  const toggle = document.getElementById('themeToggle')
  const root = document.documentElement

  if (toggle) {
    // 1999 dark is the default; "light" (cream) is the opt-in daylight mode.
    const saved = localStorage.getItem('theme')
    root.dataset.theme = saved === 'light' ? '' : 'dark'

    toggle.addEventListener('click', () => {
      const isDark = root.dataset.theme === 'dark'
      root.dataset.theme = isDark ? '' : 'dark'
      localStorage.setItem('theme', isDark ? 'light' : 'dark')
    })
  }

  // Smooth anchor clicks — route through Lenis so it matches the cinematic
  // scroll feel instead of fighting it with native smooth-scroll.
  const navHeight = nav.offsetHeight || 0
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(link.getAttribute('href'))
      if (!target) return
      if (lenis) {
        lenis.scrollTo(target, { offset: -navHeight, duration: 1.6 })
      } else {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
}

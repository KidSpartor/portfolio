// Navigation — scroll-aware background, active section tracking, progress bar
export function initNav() {
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
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      root.dataset.theme = 'dark'
    }

    toggle.addEventListener('click', () => {
      const isDark = root.dataset.theme === 'dark'
      root.dataset.theme = isDark ? '' : 'dark'
      if (isDark) {
        localStorage.removeItem('theme')
      } else {
        localStorage.setItem('theme', 'dark')
      }
    })
  }

  // Smooth anchor clicks
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(link.getAttribute('href'))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
}

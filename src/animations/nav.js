export function initNav(lenis) {
  const nav = document.getElementById('nav')
  const progressBar = document.getElementById('scrollProgress')
  if (!nav) return

  const desktopLinks = [...nav.querySelectorAll('.nav-links a')]
  const mobileMenu = document.getElementById('mobileMenu')
  const mobileLinks = [...(mobileMenu?.querySelectorAll('.mobile-menu-links a') || [])]
  const sectionLinks = [...desktopLinks, ...mobileLinks]
  const menuToggle = document.getElementById('mobileMenuToggle')
  const menuClose = document.getElementById('mobileMenuClose')

  const onScroll = () => {
    const y = window.scrollY
    nav.classList.toggle('scrolled', y > 80)
    if (!progressBar) return

    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = documentHeight > 0 ? (y / documentHeight) * 100 : 0
    progressBar.style.width = `${Math.min(progress, 100)}%`
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const sectionIds = [...new Set(sectionLinks.map((link) => link.hash.slice(1)))]
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      sectionLinks.forEach((link) => {
        link.classList.toggle('active', link.hash === `#${entry.target.id}`)
      })
    })
  }, { rootMargin: '-40% 0px -50% 0px' })
  sections.forEach((section) => observer.observe(section))

  const closeMenu = () => {
    if (mobileMenu?.open) mobileMenu.close()
  }

  menuToggle?.addEventListener('click', () => {
    if (!mobileMenu || mobileMenu.open) return
    mobileMenu.showModal()
    menuToggle.setAttribute('aria-expanded', 'true')
    document.body.classList.add('menu-open')
    menuClose?.focus()
  })
  menuClose?.addEventListener('click', closeMenu)
  mobileMenu?.addEventListener('click', (event) => {
    if (event.target === mobileMenu) closeMenu()
  })
  mobileMenu?.addEventListener('close', () => {
    menuToggle?.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('menu-open')
  })

  const themeToggle = document.getElementById('themeToggle')
  const root = document.documentElement
  if (themeToggle) {
    const saved = localStorage.getItem('theme')
    root.dataset.theme = saved === 'light' ? '' : 'dark'
    themeToggle.setAttribute('aria-pressed', String(root.dataset.theme !== 'dark'))

    themeToggle.addEventListener('click', () => {
      const isDark = root.dataset.theme === 'dark'
      root.dataset.theme = isDark ? '' : 'dark'
      localStorage.setItem('theme', isDark ? 'light' : 'dark')
      themeToggle.setAttribute('aria-pressed', String(isDark))
    })
  }

  const scrollLinks = [...sectionLinks, nav.querySelector('.nav-brand')].filter(Boolean)
  scrollLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.hash)
      if (!target) return
      event.preventDefault()
      closeMenu()
      const offset = -(nav.offsetHeight || 0)
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.25 })
      else target.scrollIntoView({ behavior: 'smooth' })
    })
  })
}

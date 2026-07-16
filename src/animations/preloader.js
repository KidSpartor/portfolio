export async function initPreloader(gsap) {
  const preloader = document.getElementById('preloader')
  if (!preloader) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const alreadySeen = sessionStorage.getItem('preloaderSeen') === '1'
  if (reduced || alreadySeen) {
    preloader.style.display = 'none'
    return
  }

  sessionStorage.setItem('preloaderSeen', '1')
  const mark = preloader.querySelector('.preloader-mark')
  const fill = preloader.querySelector('.preloader-fill')
  const timeline = gsap.timeline()

  timeline
    .fromTo(mark, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.24, ease: 'power3.out' })
    .to(fill, { width: '100%', duration: 0.38, ease: 'power2.inOut' }, 0.05)
    .to(preloader, {
      opacity: 0,
      duration: 0.24,
      ease: 'power2.inOut',
      onComplete: () => {
        preloader.style.display = 'none'
      },
    })

  await Promise.race([timeline, new Promise((resolve) => setTimeout(resolve, 950))])
  preloader.style.display = 'none'
}

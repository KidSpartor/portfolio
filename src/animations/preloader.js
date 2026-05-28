// Cinematic preloader — reveals the mark, fills the bar, then opens
export async function initPreloader(gsap) {
  const preloader = document.getElementById('preloader')
  if (!preloader) return

  const mark = preloader.querySelector('.preloader-mark')
  const fill = preloader.querySelector('.preloader-fill')

  // Animate mark appearance
  gsap.to(mark, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  })

  // Animate bar fill
  await gsap.to(fill, {
    width: '100%',
    duration: 1.4,
    ease: 'power2.inOut',
    delay: 0.3,
  })

  // Fade out preloader
  gsap.to(preloader, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.in',
    onComplete: () => {
      preloader.style.display = 'none'
    },
  })

  // Small delay for the fade to complete
  await new Promise((r) => setTimeout(r, 500))
}

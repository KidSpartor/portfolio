// Cinematic preloader — Art Deco entrance with mark, decorative elements, bar fill
export async function initPreloader(gsap) {
  const preloader = document.getElementById('preloader')
  if (!preloader) return

  const mark = preloader.querySelector('.preloader-mark')
  const fill = preloader.querySelector('.preloader-fill')

  // Create decorative diamond element
  const diamond = document.createElement('div')
  diamond.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    border: 1px solid rgba(212, 168, 67, 0.2);
    transform: translate(-50%, -50%) rotate(45deg);
    pointer-events: none;
  `
  preloader.appendChild(diamond)

  // Animate decorative diamond — scale in and rotate
  gsap.fromTo(
    diamond,
    { scale: 0, opacity: 0, rotation: 45 },
    {
      scale: 1,
      opacity: 1,
      rotation: 45,
      duration: 1,
      ease: 'power3.out',
    }
  )

  // Animate mark appearance with clip-path reveal
  gsap.fromTo(
    mark,
    { opacity: 0, y: 20, clipPath: 'inset(100% 0% 0% 0%)' },
    {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.9,
      ease: 'power4.out',
      delay: 0.2,
    }
  )

  // Animate bar fill with easing
  await gsap.to(fill, {
    width: '100%',
    duration: 1.4,
    ease: 'power2.inOut',
    delay: 0.4,
  })

  // Diamond spins out
  gsap.to(diamond, {
    scale: 1.5,
    opacity: 0,
    rotation: 135,
    duration: 0.6,
    ease: 'power3.in',
  })

  // Fade out preloader with cinematic ease
  gsap.to(preloader, {
    opacity: 0,
    duration: 0.6,
    ease: 'power3.in',
    delay: 0.1,
    onComplete: () => {
      preloader.style.display = 'none'
      diamond.remove()
    },
  })

  // Small delay for the fade to complete
  await new Promise((r) => setTimeout(r, 700))
}

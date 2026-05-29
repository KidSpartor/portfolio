// Minimal counter preloader.
export function initPreloader(gsap) {
  const pre = document.getElementById('preloader')
  if (!pre) return Promise.resolve()
  const fill = document.getElementById('preloaderFill')
  const pct = document.getElementById('preloaderPct')

  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      pre.style.display = 'none'
      resolve()
    }

    const counter = { v: 0 }
    gsap.to(counter, {
      v: 100,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        const n = Math.round(counter.v)
        if (fill) fill.style.width = n + '%'
        if (pct) pct.textContent = String(n).padStart(3, '0')
      },
      onComplete: () => {
        gsap.to(pre, { opacity: 0, duration: 0.55, ease: 'power2.out', onComplete: finish })
      },
    })

    // Hard fallback: never let a stalled rAF/animation block the whole site.
    setTimeout(finish, 2600)
  })
}

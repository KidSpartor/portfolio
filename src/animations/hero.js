// Hero scene — 重返未来1999 cinematic entrance
// Letterbox opening, character-by-character stagger with 3D rotation,
// gold wax seal T, typewriter eyebrow, statement card reveals,
// parallax scroll, decorative sunburst.

export function initHero(gsap, ScrollTrigger) {
  const hero = document.querySelector('.scene-hero')
  if (!hero) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Letterbox bars open on scroll ──
  const letterboxTop = document.querySelector('.letterbox-top')
  const letterboxBottom = document.querySelector('.letterbox-bottom')

  if (letterboxTop && letterboxBottom) {
    gsap.to([letterboxTop, letterboxBottom], {
      height: '0vh',
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=40%',
        scrub: 1,
      },
    })
  }

  // ── Create decorative sunburst SVG in hero background ──
  const sceneBg = hero.querySelector('.scene-bg')
  if (sceneBg) {
    const sunburst = document.createElement('div')
    sunburst.className = 'hero-sunburst'
    sunburst.style.cssText = `
      position: absolute;
      top: 50%;
      right: -10%;
      width: 600px;
      height: 600px;
      transform: translate(0, -50%);
      pointer-events: none;
      z-index: 0;
      opacity: 0;
    `
    sunburst.innerHTML = `
      <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        ${Array.from({ length: 36 }, (_, i) => {
          const angle = (i * 10) * Math.PI / 180
          const x1 = 300 + Math.cos(angle) * 80
          const y1 = 300 + Math.sin(angle) * 80
          const x2 = 300 + Math.cos(angle) * 280
          const y2 = 300 + Math.sin(angle) * 280
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(212,168,67,0.06)" stroke-width="0.5"/>`
        }).join('')}
        <circle cx="300" cy="300" r="80" stroke="rgba(212,168,67,0.08)" stroke-width="0.5" fill="none"/>
        <circle cx="300" cy="300" r="160" stroke="rgba(212,168,67,0.05)" stroke-width="0.5" fill="none"/>
        <circle cx="300" cy="300" r="240" stroke="rgba(212,168,67,0.03)" stroke-width="0.5" fill="none"/>
        <rect x="285" y="285" width="30" height="30" stroke="rgba(212,168,67,0.1)" stroke-width="0.5" fill="none" transform="rotate(45 300 300)"/>
      </svg>
    `
    sceneBg.appendChild(sunburst)

    // Sunburst fade in
    gsap.to(sunburst, {
      opacity: 1,
      duration: 2,
      ease: 'power3.out',
      delay: 0.5,
    })

    // Sunburst rotates slowly on scroll
    gsap.to(sunburst, {
      rotation: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }

  // ── Scene entrance — hero fades in ──
  gsap.fromTo(
    hero,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      delay: 0.05,
    }
  )

  // ── Eyebrow — typewriter letter-by-letter effect ──
  const eyebrow = hero.querySelector('.hero-eyebrow')
  if (eyebrow) {
    const label = eyebrow.querySelector('.mono-label')
    if (label) {
      const text = label.textContent
      label.textContent = ''
      label.style.opacity = '1'

      // Wrap each character in a span
      const chars = text.split('').map((char) => {
        const span = document.createElement('span')
        span.textContent = char === ' ' ? '\u00A0' : char
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        label.appendChild(span)
        return span
      })

      // Typewriter reveal
      gsap.to(chars, {
        opacity: 1,
        duration: 0.04,
        stagger: 0.04,
        ease: 'none',
        delay: 0.3,
      })
    }

    // Pulse dot entrance
    const dot = eyebrow.querySelector('.pulse-dot')
    if (dot) {
      gsap.fromTo(
        dot,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          delay: 0.2,
        }
      )
    }
  }

  // ── Hero title — character-by-character stagger with 3D rotation ──
  const titleLines = hero.querySelectorAll('.hero-title-line')
  titleLines.forEach((line, lineIndex) => {
    const text = line.textContent
    // Preserve inner HTML (for <em> tags)
    const html = line.innerHTML
    line.innerHTML = ''
    line.style.perspective = '800px'

    // Parse the HTML to wrap each character
    const temp = document.createElement('div')
    temp.innerHTML = html

    const charSpans = []
    function walkNodes(node, parent) {
      if (node.nodeType === 3) {
        // Text node — wrap each character
        const chars = node.textContent.split('')
        chars.forEach((char) => {
          const span = document.createElement('span')
          span.textContent = char === ' ' ? '\u00A0' : char
          span.style.display = 'inline-block'
          span.style.opacity = '0'
          span.style.transform = 'rotateX(-15deg)'
          span.style.transformOrigin = 'bottom center'
          if (node.parentNode.tagName === 'EM') {
            span.style.color = 'var(--accent)'
            span.style.fontStyle = 'italic'
          }
          parent.appendChild(span)
          charSpans.push(span)
        })
      } else if (node.nodeType === 1) {
        // Element node — recurse
        const clone = document.createElement(node.tagName)
        // Copy relevant styles
        if (node.tagName === 'EM') {
          clone.style.color = 'var(--accent)'
          clone.style.fontStyle = 'italic'
        }
        parent.appendChild(clone)
        Array.from(node.childNodes).forEach((child) => walkNodes(child, clone))
      }
    }
    Array.from(temp.childNodes).forEach((child) => walkNodes(child, line))

    // Stagger reveal with rotation
    gsap.to(charSpans, {
      opacity: 1,
      rotateX: 0,
      duration: 0.6,
      stagger: 0.025,
      ease: 'power4.out',
      delay: 0.4 + lineIndex * 0.2,
    })
  })

  // ── Gold wax seal "T" — scale in with bounce ──
  const heroTitle = hero.querySelector('.hero-title')
  if (heroTitle) {
    const seal = document.createElement('div')
    seal.className = 'hero-wax-seal'
    seal.style.cssText = `
      position: absolute;
      top: -20px;
      right: -40px;
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,168,67,0.25), rgba(212,168,67,0.08));
      border: 2px solid rgba(212,168,67,0.4);
      box-shadow: 0 0 30px rgba(212,168,67,0.15), inset 0 0 15px rgba(212,168,67,0.1);
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 600;
      color: var(--accent);
      pointer-events: none;
      z-index: 5;
    `
    seal.textContent = 'T'
    heroTitle.style.position = 'relative'
    heroTitle.appendChild(seal)

    gsap.fromTo(
      seal,
      { scale: 0, opacity: 0, rotation: -20 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.8,
        ease: 'back.out(2)',
        delay: 1.0,
      }
    )
  }

  // ── Subtitle — fade up ──
  const subtitle = hero.querySelector('.hero-subtitle')
  if (subtitle) {
    gsap.fromTo(
      subtitle,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        delay: 1.0,
      }
    )
  }

  // ── Hero statements — clip-path reveal from left, staggered ──
  const statements = hero.querySelectorAll('.hero-statement')
  if (statements.length) {
    statements.forEach((stmt, i) => {
      gsap.fromTo(
        stmt,
        {
          opacity: 0,
          x: -30,
          clipPath: 'inset(0% 100% 0% 0%)',
        },
        {
          opacity: 1,
          x: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.9,
          ease: 'power4.out',
          delay: 1.2 + i * 0.15,
        }
      )
    })
  }

  // ── Scroll cue ──
  const scrollCue = hero.querySelector('.hero-scroll-cue')
  if (scrollCue) {
    gsap.fromTo(
      scrollCue,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 1.6,
      }
    )
  }

  // ── Hero parallax on scroll — content moves up and fades ──
  const heroContent = hero.querySelector('.hero-content')
  if (heroContent) {
    gsap.to(heroContent, {
      y: -120,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }

  // ── Counter fade ──
  const counter = hero.querySelector('.hero-counter')
  if (counter) {
    gsap.to(counter, {
      opacity: 0,
      scrollTrigger: {
        trigger: hero,
        start: '30% top',
        end: '60% top',
        scrub: 1,
      },
    })
  }
}

// Story scene — 重返未来1999 pinned section
// Background STUDIO text parallax (dramatic), story blocks clip-path from bottom,
// principle cards clip-path from left, principle numbers wax-seal scale-in,
// bio text letter-spacing animation, decorative ornamental line draws between principles.

export function initStory(gsap, ScrollTrigger) {
  const section = document.querySelector('.scene-story')
  const pin = document.getElementById('storyPin')
  if (!section || !pin) return

  const blocks = section.querySelectorAll('[data-story]')
  const bgText = section.querySelector('.story-bg-text')

  // ── Pin the story section ──
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom-=30% top',
    pin: pin,
    scrub: 1,
  })

  // ── Background STUDIO text — dramatic parallax ──
  if (bgText) {
    // Make it larger and more dramatic
    gsap.set(bgText, {
      fontSize: 'clamp(180px, 30vw, 480px)',
      fontWeight: 800,
      letterSpacing: '0.2em',
    })

    // Horizontal parallax
    gsap.to(bgText, {
      x: '-30%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    // Opacity pulse — fade in then hold
    gsap.fromTo(
      bgText,
      { opacity: 0.08 },
      {
        opacity: 0.3,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '30% top',
          scrub: 1,
        },
      }
    )
  }

  // ── Story blocks — clip-path reveal from bottom ──
  blocks.forEach((block, i) => {
    gsap.fromTo(
      block,
      {
        opacity: 0,
        y: 60,
        clipPath: 'inset(100% 0% 0% 0%)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: section,
          start: `${i * 15}% top`,
          end: `${(i + 1) * 15 + 10}% top`,
          scrub: 1,
        },
      }
    )
  })

  // ── Bio text — letter-spacing animation from 0.1em to 0.02em ──
  const bioText = section.querySelector('.bio-text')
  if (bioText) {
    gsap.fromTo(
      bioText,
      { letterSpacing: '0.1em', opacity: 0.5 },
      {
        letterSpacing: '0.02em',
        opacity: 1,
        scrollTrigger: {
          trigger: section,
          start: '15% top',
          end: '45% top',
          scrub: 1,
        },
      }
    )
  }

  // ── Principle cards — clip-path from left ──
  const principles = section.querySelectorAll('.principle')
  principles.forEach((p, i) => {
    const num = p.querySelector('.principle-num')

    // Card reveal from left
    gsap.fromTo(
      p,
      {
        opacity: 0,
        x: -40,
        clipPath: 'inset(0% 100% 0% 0%)',
      },
      {
        opacity: 1,
        x: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: section,
          start: `${50 + i * 12}% top`,
          toggleActions: 'play none none none',
        },
      }
    )

    // Principle number — wax-seal-like scale-in with bounce
    if (num) {
      gsap.fromTo(
        num,
        {
          scale: 0,
          opacity: 0,
          rotation: -15,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.7,
          ease: 'back.out(2.5)',
          scrollTrigger: {
            trigger: section,
            start: `${52 + i * 12}% top`,
            toggleActions: 'play none none none',
          },
        }
      )
    }
  })

  // ── Decorative ornamental line that draws itself between principles ──
  if (principles.length > 1) {
    const principlesContainer = section.querySelector('.story-principles')
    if (principlesContainer) {
      // Create SVG ornamental line
      const ornament = document.createElement('div')
      ornament.className = 'story-ornament'
      ornament.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: 2px;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      `
      ornament.innerHTML = `
        <svg width="2" height="100%" viewBox="0 0 2 100" preserveAspectRatio="none" style="width:100%;height:100%;">
          <line x1="1" y1="0" x2="1" y2="100" stroke="rgba(212,168,67,0.2)" stroke-width="1"
            stroke-dasharray="100" stroke-dashoffset="100" class="story-ornament-line"/>
        </svg>
      `
      principlesContainer.style.position = 'relative'
      principlesContainer.appendChild(ornament)

      // Animate the line drawing itself
      const line = ornament.querySelector('.story-ornament-line')
      if (line) {
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: '50% top',
            end: '85% top',
            scrub: 1,
          },
        })
      }

      // Add small diamond ornaments at intervals
      const diamondPositions = [0.15, 0.5, 0.85]
      diamondPositions.forEach((pos) => {
        const diamond = document.createElement('div')
        diamond.style.cssText = `
          position: absolute;
          left: -4px;
          top: ${pos * 100}%;
          width: 10px;
          height: 10px;
          border: 1px solid rgba(212,168,67,0.3);
          transform: rotate(45deg);
          background: var(--bg);
          pointer-events: none;
          opacity: 0;
        `
        ornament.appendChild(diamond)

        gsap.to(diamond, {
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: `${50 + pos * 35}% top`,
            toggleActions: 'play none none none',
          },
        })
      })
    }
  }

  // ── Story border — fade in as section enters ──
  gsap.fromTo(
    pin,
    { '--border-opacity': '0' },
    {
      '--border-opacity': '0.3',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      },
    }
  )
}

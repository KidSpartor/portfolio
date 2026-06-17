# Kid Spartor Studio

Personal portfolio site for Kid Spartor, built as a Vite-powered static site with modular JavaScript, GSAP/ScrollTrigger animation, Lenis smooth scrolling, bilingual copy, and a bundled interactive deep-learning course.

## Structure

- `index.html` — main portfolio markup.
- `src/main.js` — initializes navigation, animation, ambient, audio, fog, and i18n systems.
- `src/styles/main.css` — global visual system and responsive layout.
- `src/animations/` — scene and interaction modules.
- `src/utils/` — i18n, audio, and ambient visual tuning.
- `public/dl-zero-to-unet/` — static interactive course published under `/portfolio/dl-zero-to-unet/html/`.
- `public/bgm.mp3` — optional background audio, loaded only after user opt-in.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

The site is configured with `base: '/portfolio/'` in `vite.config.js`, matching GitHub Pages deployment at:

```text
https://kidspartor.github.io/portfolio/
```

## Design Notes

The current direction is cinematic Art Deco with London imagery, film grain, letterbox framing, and restrained interactive effects. The content should stay concrete: shipped projects, implementation details, notes, and contact routes.

## Maintenance Priorities

- Keep card imagery aligned with project content.
- Prefer local optimized assets for critical images when possible.
- Keep decorative layers clipped so they do not create horizontal scroll.
- Keep animation optional and reduced-motion aware.
- Update both English and Chinese copy in `src/utils/i18n.js` when changing visible text.

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function ProjectCard({ index, category, title, description, tags, highlights, children, reverse }) {
  const [ref, visible] = useScrollReveal()
  const demoRef = useRef(null)

  const handleMouseMove = (e) => {
    const el = demoRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.01)`
  }

  const handleMouseLeave = () => {
    if (demoRef.current) demoRef.current.style.transform = ''
  }

  const accentColors = ['bg-accent', 'bg-accent2', 'bg-accent3']
  const indexColor = accentColors[index % 3]
  const indexTextColors = ['text-accent', 'text-accent2', 'text-accent3']
  const indexBgColors = [
    'bg-accent/8 border-accent/12',
    'bg-accent2/8 border-accent2/12',
    'bg-accent3/8 border-accent3/12',
  ]
  const dotColors = ['bg-accent', 'bg-accent2', 'bg-accent3', 'bg-pink-500', 'bg-green-500', 'bg-indigo-500']

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-24 last:mb-0 ${
        reverse ? 'lg:[direction:rtl]' : ''
      }`}
    >
      {/* Demo area */}
      <div
        ref={demoRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="hoverable relative rounded-2xl overflow-hidden aspect-[16/10] bg-elevated border border-border-subtle transition-all duration-500 cursor-none lg:[direction:ltr]"
      >
        {children}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-5 lg:[direction:ltr]">
        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs font-medium px-2.5 py-1 rounded-md border ${indexBgColors[index % 3]} ${indexTextColors[index % 3]}`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-xs text-text-dim font-medium tracking-[0.1em] uppercase">{category}</span>
        </div>

        <h3 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
          {title}
        </h3>

        <p className="text-text-secondary text-base leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="hoverable px-2.5 py-1 rounded-md text-xs font-semibold bg-surface border border-border-subtle text-text-secondary tracking-wide transition-all duration-200 hover:border-border-hover hover:text-text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {highlights.map((h, i) => (
            <div key={h} className="flex items-center gap-2 text-sm text-text-secondary">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColors[i % dotColors.length]} shrink-0`} />
              {h}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

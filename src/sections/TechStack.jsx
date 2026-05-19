import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import SectionLabel from '../components/SectionLabel'

const techs = [
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'Python', color: '#3776ab' },
  { name: 'React', color: '#61dafb' },
  { name: 'React Native', color: '#61dafb' },
  { name: 'Electron', color: '#47848f' },
  { name: 'Expo', color: '#ffffff' },
  { name: 'TailwindCSS', color: '#38bdf8' },
  { name: 'Vite', color: '#646cff' },
  { name: 'Pygame', color: '#3ecc5f' },
  { name: 'Supabase', color: '#3fcf8e' },
  { name: 'Framer Motion', color: '#d946ef' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Google APIs', color: '#4285f4' },
  { name: 'NumPy', color: '#4dabcf' },
  { name: 'Git', color: '#f05032' },
  { name: 'macOS', color: '#ffffff' },
]

export default function TechStack() {
  const [ref, visible] = useScrollReveal()

  return (
    <section id="stack" className="py-24 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel num="04" title="Stack" />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          {techs.map(({ name, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="hoverable flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface border border-border-subtle text-sm font-medium text-text-secondary transition-all duration-250 hover:border-border-hover hover:text-text-primary hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

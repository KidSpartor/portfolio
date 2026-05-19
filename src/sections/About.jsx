import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import SectionLabel from '../components/SectionLabel'

const stats = [
  { value: '3', label: 'Featured Projects', color: 'text-accent' },
  { value: '10+', label: 'Technologies', color: 'text-accent2' },
  { value: '3', label: 'Platforms', color: 'text-accent3' },
  { value: '5K+', label: 'Lines of Code', color: 'text-pink-500' },
]

export default function About() {
  const [ref, visible] = useScrollReveal()
  const [statsRef, statsVisible] = useScrollReveal()

  return (
    <section id="about" className="py-24 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel num="03" title="About" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5"
          >
            <p className="text-text-secondary text-lg leading-relaxed">
              I'm a <strong className="text-text-primary font-semibold">full-stack developer</strong> who loves
              turning ideas into polished, interactive experiences. From building desktop apps with native-level
              performance to crafting multiplayer games with real-time networking, I enjoy tackling complex challenges
              across the entire stack.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed">
              My work spans <strong className="text-text-primary font-semibold">desktop applications</strong>,{' '}
              <strong className="text-text-primary font-semibold">2D games</strong>, and{' '}
              <strong className="text-text-primary font-semibold">cross-platform multiplayer systems</strong> &mdash;
              each project pushing me to learn new technologies and solve interesting engineering problems.
            </p>
          </motion.div>

          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={statsVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map(({ value, label, color }) => (
              <div
                key={label}
                className="hoverable bg-surface border border-border-subtle rounded-2xl p-6 transition-all duration-300 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              >
                <div className={`font-heading text-4xl font-extrabold tracking-tight mb-1 ${color}`}>
                  {value}
                </div>
                <div className="text-sm text-text-dim font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

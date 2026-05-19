import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import SectionLabel from '../components/SectionLabel'
import { Lightbulb, Code, Rocket, Zap } from 'lucide-react'

const milestones = [
  {
    icon: Lightbulb,
    period: 'Getting Started',
    title: 'First Lines of Code',
    desc: 'Started learning Python and fell in love with programming. Built small scripts, games, and automation tools while discovering the joy of creating something from nothing.',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/20',
    bgColor: 'bg-amber-400/[0.06]',
  },
  {
    icon: Code,
    period: 'Going Deeper',
    title: 'Desktop & Games',
    desc: 'Dove into Pygame for game development and built Starship Odyssey. Learned physics simulation, procedural generation, and sound design. Later picked up Electron + React for desktop apps.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
    bgColor: 'bg-cyan-400/[0.06]',
  },
  {
    icon: Rocket,
    period: 'Full-Stack',
    title: 'Web & Mobile',
    desc: 'Expanded into full-stack development with React, React Native, and Supabase. Built a multiplayer poker game supporting web and mobile with real-time networking and complex game logic.',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/20',
    bgColor: 'bg-purple-400/[0.06]',
  },
  {
    icon: Zap,
    period: 'Now',
    title: 'Building Forward',
    desc: 'Continuing to explore new technologies and push the boundaries of what I can build. Focused on creating polished, production-quality applications that people enjoy using.',
    color: 'text-green-400',
    borderColor: 'border-green-400/20',
    bgColor: 'bg-green-400/[0.06]',
  },
]

function MilestoneCard({ milestone, index }) {
  const [ref, visible] = useScrollReveal()
  const Icon = milestone.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative flex gap-6 items-start"
    >
      {/* Timeline dot & line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-10 h-10 rounded-xl ${milestone.bgColor} border ${milestone.borderColor} flex items-center justify-center`}>
          <Icon size={18} className={milestone.color} />
        </div>
        {index < milestones.length - 1 && (
          <div className="w-px flex-1 min-h-[60px] bg-gradient-to-b from-border-hover to-transparent mt-3" />
        )}
      </div>

      {/* Content */}
      <div className="pb-10">
        <span className={`text-xs font-semibold ${milestone.color} tracking-wider uppercase`}>
          {milestone.period}
        </span>
        <h3 className="font-heading text-xl font-bold mt-1 mb-2">{milestone.title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed max-w-md">{milestone.desc}</p>
      </div>
    </motion.div>
  )
}

export default function Journey() {
  return (
    <section id="journey" className="py-24 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel num="02" title="Journey" />
        <div className="max-w-2xl">
          {milestones.map((m, i) => (
            <MilestoneCard key={m.title} milestone={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function SectionLabel({ num, title }) {
  const [ref, visible] = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-6 mb-16"
    >
      <span className="font-mono text-sm font-medium text-accent tracking-wider">{num}</span>
      <div className="flex-1 h-px bg-border-subtle" />
      <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
    </motion.div>
  )
}

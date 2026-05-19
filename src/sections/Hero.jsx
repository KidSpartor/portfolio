import { motion } from 'framer-motion'
import { GitBranch } from 'lucide-react'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative z-10 px-6">
      <div className="max-w-[900px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/[0.06] border border-accent/15 text-accent text-xs font-semibold tracking-[0.1em] uppercase mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-pulse" />
          Available for Projects
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-heading font-black text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.03em] mb-8"
        >
          <span className="block">Building</span>
          <span className="block bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            Interactive
          </span>
          <span className="block">Experiences</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-[clamp(1.05rem,2vw,1.3rem)] text-text-secondary max-w-[580px] mx-auto mb-10 leading-relaxed"
        >
          I craft desktop apps, multiplayer games, and cross-platform systems
          with care for detail, performance, and beautiful interfaces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          <a
            href="#projects"
            className="hoverable inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg font-semibold text-sm transition-all duration-250 hover:shadow-[0_0_40px_rgba(34,211,238,0.2),0_8px_24px_rgba(34,211,238,0.15)] hover:-translate-y-0.5 no-underline"
          >
            <GitBranch size={16} />
            View Projects
          </a>
          <a
            href="#about"
            className="hoverable inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface text-text-primary font-semibold text-sm border border-border-subtle backdrop-blur-sm transition-all duration-250 hover:bg-surface-hover hover:border-border-hover hover:-translate-y-0.5 no-underline"
          >
            Learn More
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-text-dim tracking-[0.15em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-text-dim to-transparent animate-pulse" />
      </motion.div>
    </section>
  )
}

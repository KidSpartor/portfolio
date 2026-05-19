import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const links = [
  { href: '#projects', label: 'Projects' },
  { href: '#journey', label: 'Journey' },
  { href: '#about', label: 'About' },
  { href: '#stack', label: 'Stack' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = links.map(l => document.querySelector(l.href)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive('#' + e.target.id)
        })
      },
      { threshold: 0.3 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-2.5 rounded-full border transition-all duration-400 backdrop-blur-2xl ${
        scrolled
          ? 'bg-bg/85 border-border-hover shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-bg/60 border-border-subtle'
      }`}
    >
      <a href="#" className="hoverable font-heading font-extrabold text-lg tracking-tight">
        <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
          TM.
        </span>
      </a>
      <ul className="flex gap-4 list-none m-0 p-0">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className={`hoverable text-sm font-medium tracking-wide transition-colors duration-200 no-underline ${
                active === href ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
              {active === href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="h-0.5 mt-0.5 rounded-full bg-gradient-to-r from-accent to-accent2"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  )
}

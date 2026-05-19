import SectionLabel from '../components/SectionLabel'
import ProjectCard from '../components/ProjectCard'
import MusicPlayerDemo from '../components/demos/MusicPlayerDemo'
import StarshipDemo from '../components/demos/StarshipDemo'
import PokerDemo from '../components/demos/PokerDemo'

const projects = [
  {
    category: 'Desktop Application',
    title: 'Music Player',
    description:
      'A polished macOS desktop music player built with Electron and React. Features a vinyl record visualization that spins with playback, synchronized LRC lyrics display, Google Drive cloud streaming, and dynamic color themes extracted from album artwork.',
    tags: ['Electron', 'React', 'TailwindCSS', 'Framer Motion', 'Google Drive API', 'Vite'],
    highlights: [
      'Spinning vinyl visualization',
      'Real-time lyrics sync',
      'Cloud music streaming',
      'Adaptive color theming',
      'Mini player mode',
      'ID3 metadata parsing',
    ],
    demo: MusicPlayerDemo,
  },
  {
    category: '2D Game',
    title: 'Starship Odyssey',
    description:
      'A physics-based space puzzle game where you navigate a spaceship through hazardous environments using a tractor beam. Manage energy while collecting supply stations, dodging black holes, and avoiding space storms across 10 procedurally-seeded levels.',
    tags: ['Python', 'Pygame', 'NumPy', 'PyInstaller'],
    highlights: [
      'Custom physics engine',
      '10 progressive levels',
      'Procedural sound effects',
      'macOS native .app',
      'Particle beam effects',
      'Seed-based level gen',
    ],
    demo: StarshipDemo,
    reverse: true,
  },
  {
    category: 'Full-Stack Multiplayer',
    title: 'Texas Poker Pro',
    description:
      'A production-grade multiplayer Texas Hold\'em poker game with web and mobile clients. Supports 2-9 players via Supabase real-time broadcast, with hand evaluation, intelligent side pot distribution, NPC opponents, and an interactive betting interface.',
    tags: ['React', 'React Native', 'Expo', 'Supabase', 'TailwindCSS', 'WebSocket'],
    highlights: [
      '2-9 player multiplayer',
      'Real-time sync',
      'Side pot algorithm',
      'Hand evaluation engine',
      'Cross-platform',
      'NPC opponents',
    ],
    demo: PokerDemo,
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel num="01" title="Projects" />
        {projects.map((project, i) => {
          const Demo = project.demo
          return (
            <ProjectCard
              key={project.title}
              index={i}
              category={project.category}
              title={project.title}
              description={project.description}
              tags={project.tags}
              highlights={project.highlights}
              reverse={project.reverse}
            >
              <Demo />
            </ProjectCard>
          )
        })}
      </div>
    </section>
  )
}

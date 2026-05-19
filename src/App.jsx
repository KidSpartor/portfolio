import Background from './components/Background'
import ParticleField from './components/ParticleField'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Journey from './sections/Journey'
import About from './sections/About'
import TechStack from './sections/TechStack'
import Footer from './sections/Footer'

export default function App() {
  return (
    <>
      <Background />
      <ParticleField />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <Journey />
        <About />
        <TechStack />
      </main>
      <Footer />
    </>
  )
}

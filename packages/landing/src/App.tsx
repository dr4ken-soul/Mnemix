import Nav from './components/layout/Nav'
import Hero from './components/sections/Hero'
import TerminalMoment from './components/sections/TerminalMoment'
import ThreePillars from './components/sections/ThreePillars'
import Setup from './components/sections/Setup'
import Faq from './components/sections/Faq'
import Footer from './components/sections/Footer'
import GrainOverlay from './components/ui/GrainOverlay'
import './styles/globals.css'

/**
 * Root landing page assembly. Single-page layout in section order.
 */
export default function App() {
  return (
    <main className="relative">
      <GrainOverlay />
      <Nav />
      <Hero />
      <TerminalMoment />
      <ThreePillars />
      <Setup />
      <Faq />
      <Footer />
    </main>
  )
}

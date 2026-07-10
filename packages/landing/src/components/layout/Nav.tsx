import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

/**
 * Fixed liquid-glass navigation pill floating above the hero.
 * Gains a slightly stronger glass opacity after leaving the hero.
 * Wordmark left, single Install CTA right. No centre links.
 */
export default function Nav() {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    /**
     * Updates nav glass strength based on scroll past the hero height.
     */
    function onScroll() {
      setPastHero(window.scrollY > window.innerHeight * 0.72)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed left-1/2 top-6 z-[100] w-full max-w-2xl -translate-x-1/2 px-4">
      <motion.nav
        className="liquid-glass flex items-center justify-between rounded-full px-5 py-3"
        animate={{
          backgroundColor: pastHero
            ? 'rgba(255, 255, 255, 0.07)'
            : 'rgba(255, 255, 255, 0.04)',
          borderColor: pastHero
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(255, 255, 255, 0.08)',
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          {/* Logo slot: replace with public/logo.svg once provided */}
          <span className="font-serif text-lg font-normal text-[var(--text-primary)]">
            Mnemix
          </span>
        </div>
        <a
          href="#install"
          className="nav-cta rounded-full bg-[var(--accent)] px-4 py-2 font-sans text-sm font-medium text-[var(--bg-primary)]"
        >
          Install Mnemix
        </a>
      </motion.nav>
    </header>
  )
}

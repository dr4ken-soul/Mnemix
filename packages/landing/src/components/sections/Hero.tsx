import { useEffect, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Check, Copy } from 'lucide-react'
import Magnet from '../ui/Magnet'
import { useParallax } from '../../hooks/useParallax'

const INSTALL_COMMAND = 'npm install -g mnemix && mnemix install'

/**
 * Drives a slow sine-wave ambient float on a motion value.
 * Amplitude is a few pixels so the image never feels dead after load.
 * @param floatY - motion value to update
 */
function useAmbientFloat(floatY: MotionValue<number>) {
  useEffect(() => {
    let raf = 0
    const amplitude = 6
    const speed = 0.0011

    /**
     * Advances the ambient float one animation frame.
     * @param time - high-resolution timestamp
     */
    function tick(time: number) {
      floatY.set(Math.sin(time * speed) * amplitude)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [floatY])
}

/**
 * Full-viewport hero.
 * Upper stack sits in the dark void above the diamond.
 * Install command and CTA sit lower over the art.
 * Image layer gets mouse parallax plus a soft ambient float.
 */
export default function Hero() {
  const { x: parallaxX, y: parallaxY } = useParallax(12)
  const [copied, setCopied] = useState(false)
  const floatY = useMotionValue(0)
  const ambientY = useSpring(floatY, { stiffness: 18, damping: 28 })
  const imageY = useTransform(
    [parallaxY, ambientY],
    ([py, ay]: number[]) => (py as number) + (ay as number),
  )

  useAmbientFloat(floatY)

  /**
   * Copies the install command and shows a check icon for 1.5 seconds.
   */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable. Stay silent.
    }
  }

  return (
    <section className="relative h-[100dvh] min-h-[640px] overflow-hidden">
      {/* Background image layer */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-[-20px]"
          style={{ x: parallaxX, y: imageY }}
        >
          <img
            src="/hero.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[center_58%]"
          />
        </motion.div>
      </div>

      {/* Full-height gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, var(--bg-primary) 0%, rgba(9, 11, 17, 0.72) 28%, rgba(9, 11, 17, 0.35) 48%, transparent 68%)',
        }}
      />

      {/* Bottom gradient overlay */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background:
            'linear-gradient(to top, rgba(9, 11, 17, 0.88) 0%, rgba(9, 11, 17, 0.45) 45%, transparent 100%)',
        }}
      />

      {/* All hero content in a single flex column, vertically distributed */}
      <div className="relative z-10 flex h-full flex-col items-center px-6">
        {/* Top zone: badge + heading -- sits in the dark void above the diamond */}
        <div className="flex flex-col items-center gap-3 pt-[max(5.5rem,14vh)] text-center sm:gap-4 md:pt-[max(6.5rem,16vh)]">
          <motion.span
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--accent)] sm:text-[12px]"
            initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 }}
          >
            shell memory daemon
          </motion.span>

          <motion.h1
            className="max-w-3xl font-serif text-[1.75rem] font-normal leading-[1.12] text-[var(--text-primary)] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem]"
            initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            Your terminal remembers.
            <br />
            You never repeat yourself.
          </motion.h1>
        </div>

        {/* Upper spacer: diamond breathes below the heading */}
        <div className="flex-[3]" />

        {/* Middle zone: description text -- visually anchored near the diamond rock base */}
        <motion.p
          className="max-w-md text-center font-sans text-sm font-light leading-relaxed text-[var(--text-secondary)] sm:text-base"
          initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          Mnemix hooks into your shell and surfaces fixes from your own history
          the moment a command fails.
        </motion.p>

        {/* Spacer between description and install command */}
        <div className="flex-[1]" />

        {/* Install command -- centered between description and CTA */}
        <motion.div
          className="command-block liquid-glass-dark flex w-full max-w-[min(100%,28rem)] items-center justify-between gap-3 rounded-lg px-4 py-3 sm:min-w-[320px] sm:gap-4 sm:px-5 sm:py-3.5"
          initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <code className="truncate font-mono text-xs text-[var(--text-primary)] sm:text-sm">
            {INSTALL_COMMAND}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="copy-btn shrink-0 text-[var(--text-secondary)]"
            aria-label={copied ? 'Copied' : 'Copy command'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </motion.div>

        {/* Spacer between install command and CTA */}
        <div className="flex-[1]" />

        {/* CTA button at bottom */}
        <div className="pb-[max(2rem,5vh)] md:pb-[max(2.5rem,6vh)]">
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <Magnet>
              <a
                href="#install"
                className="cta-pill inline-block rounded-full bg-[var(--accent)] px-6 py-3 font-sans text-sm font-medium text-[var(--bg-primary)]"
              >
                Install Mnemix
              </a>
            </Magnet>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

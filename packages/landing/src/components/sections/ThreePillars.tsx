import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import type { MouseEvent } from 'react'
import { useRef } from 'react'
import FadeIn from '../ui/FadeIn'

const pillars = [
  {
    title: 'Silent',
    body: 'Runs as a shell hook with no perceived latency. Nothing blocks your prompt. You will not notice it until you need it.',
  },
  {
    title: 'Semantic',
    body: 'Searches by meaning, not keywords. A different error message for the same underlying problem still matches the fix you already know.',
  },
  {
    title: 'Local',
    body: 'Your command history never leaves your machine. Supermemory Local runs the full memory layer on your laptop. No account, no cloud, no tracking.',
  },
] as const

/**
 * Renders a feature card with 3D tilt on hover.
 * Uses motion values for smooth cursor-tracked rotation.
 * Returns to flat when cursor leaves.
 * @param title - card heading
 * @param body - card description
 */
function TiltCard({ title, body }: { title: string; body: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  })

  /**
   * Updates tilt axes from cursor position within the card bounds.
   * @param e - mouse move event on the card
   */
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  /**
   * Resets tilt to flat when the cursor leaves the card.
   */
  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6"
    >
      <h3 className="mb-3 font-sans text-lg font-medium text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="font-sans text-sm font-light leading-relaxed text-[var(--text-secondary)]">
        {body}
      </p>
    </motion.div>
  )
}

/**
 * Two-column pillars section: left sticky heading with scroll progress,
 * right stacked tilt cards.
 */
export default function ThreePillars() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const headingY = useTransform(scrollYProgress, [0.15, 0.7], [24, -24])
  const headingOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.25, 0.75, 0.9],
    [0.55, 1, 1, 0.7],
  )

  return (
    <section ref={sectionRef} className="bg-[var(--bg-primary)] px-4 py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <motion.div
            className="lg:sticky lg:top-32 lg:self-start"
            style={{ y: headingY, opacity: headingOpacity }}
          >
            <h2 className="max-w-xs font-serif text-3xl font-normal leading-tight text-[var(--text-primary)] md:text-5xl">
              Silent. Semantic. Local.
            </h2>
            <p className="mt-6 max-w-xs font-sans text-base font-light text-[var(--text-secondary)]">
              Three principles that make Mnemix different from every other shell
              history tool.
            </p>
          </motion.div>
        </FadeIn>

        <div className="flex flex-col gap-6">
          {pillars.map((pillar, index) => (
            <FadeIn key={pillar.title} delay={index * 0.08}>
              <TiltCard title={pillar.title} body={pillar.body} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import FadeIn from '../ui/FadeIn'

const lines = [
  {
    key: 'cmd',
    parts: [
      { text: '$ ', className: 'text-[var(--text-muted)]' },
      { text: 'git pull origin main', className: 'text-[var(--text-primary)]' },
    ],
  },
  {
    key: 'err1',
    parts: [
      {
        text: 'error: Your local changes would be overwritten by merge',
        style: { color: '#ef4444' } as const,
      },
    ],
  },
  {
    key: 'err2',
    parts: [
      {
        text: 'Please commit your changes or stash them before you merge.',
        style: { color: '#ef4444' } as const,
      },
    ],
  },
  { key: 'gap', parts: [{ text: '\u00a0', className: '' }], gapAfter: true },
  {
    key: 'mnemix',
    parts: [
      {
        text: 'mnemix › found 1 match from 3 weeks ago',
        className: 'text-[var(--accent)]',
      },
    ],
  },
  {
    key: 'fix',
    parts: [
      {
        text: 'fix: git stash && git pull origin main',
        className: 'text-[var(--text-primary)]',
      },
    ],
  },
  {
    key: 'ctx',
    parts: [
      {
        text: 'context: ~/projects/api · branch: main',
        className: 'text-[var(--text-muted)]',
      },
    ],
  },
] as const

/**
 * Framed terminal mockup with staggered line reveal on enter.
 * Lines stay fully readable after the sequence (no typewriter cutoff).
 */
export default function TerminalMoment() {
  const bodyRef = useRef<HTMLDivElement>(null)
  const inView = useInView(bodyRef, {
    once: false,
    amount: 0.4,
    margin: '0px 0px -40px 0px',
  })

  return (
    <section className="bg-[var(--bg-secondary)] px-4 py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-12">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-serif text-3xl font-normal leading-tight text-[var(--text-primary)] md:text-5xl">
              The fix is already in your history.
            </h2>
            <p className="mx-auto mt-4 max-w-sm font-sans text-base font-light text-[var(--text-secondary)]">
              Mnemix searches what you have already solved. Not the internet.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div
            className="w-full max-w-[720px] overflow-hidden rounded-xl border border-[var(--border-default)]"
            style={{
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: '#3a3a3a' }}
              />
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: '#4a4a4a' }}
              />
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: '#5a5a5a' }}
              />
              <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">
                bash — mnemix
              </span>
            </div>

            <div
              ref={bodyRef}
              className="bg-[var(--bg-elevated)] p-6 font-mono text-sm leading-7"
            >
              {lines.map((line, index) => (
                <motion.p
                  key={line.key}
                  className={'gapAfter' in line && line.gapAfter ? 'mb-2' : undefined}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={
                    inView
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 8, filter: 'blur(4px)' }
                  }
                  transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                    delay: inView ? index * 0.12 : 0,
                  }}
                >
                  {line.parts.map((part, partIndex) => (
                    <span
                      key={partIndex}
                      className={'className' in part ? part.className : undefined}
                      style={'style' in part ? part.style : undefined}
                    >
                      {part.text}
                    </span>
                  ))}
                </motion.p>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

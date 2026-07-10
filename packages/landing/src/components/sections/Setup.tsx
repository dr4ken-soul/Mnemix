import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import FadeIn from '../ui/FadeIn'

interface SetupStepProps {
  number: string
  heading: string
  command: string
  note: string
  delay?: number
}

/**
 * Renders a numbered setup step with a copyable command block.
 * Handles copy state internally with a 1500ms revert timer.
 * @param number - step label string e.g. "step 01"
 * @param heading - step title
 * @param command - the command to display and copy
 * @param note - descriptive note below the command
 * @param delay - FadeIn delay in seconds
 */
function SetupStep({ number, heading, command, note, delay = 0 }: SetupStepProps) {
  const [copied, setCopied] = useState(false)

  /**
   * Copies the step command and shows a check icon for 1.5 seconds.
   */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable. Stay silent.
    }
  }

  return (
    <FadeIn delay={delay}>
      <div className="mb-8 border-t border-[var(--border-subtle)] pt-8 text-left">
        <span className="font-mono text-[12px] uppercase tracking-[0.15em] text-[var(--accent)]">
          {number}
        </span>
        <h3 className="mb-6 mt-2 font-sans text-lg font-medium text-[var(--text-primary)]">
          {heading}
        </h3>
        <div className="command-block liquid-glass-dark flex items-center justify-between gap-4 rounded-lg px-5 py-3.5">
          <code className="flex-1 font-mono text-sm text-[var(--text-primary)]">
            {command}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="copy-btn text-[var(--text-secondary)]"
            aria-label={copied ? 'Copied' : 'Copy command'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="mt-4 font-sans text-sm font-light text-[var(--text-muted)]">
          {note}
        </p>
      </div>
    </FadeIn>
  )
}

/**
 * Two-step install section. Supermemory Local first, then Mnemix.
 */
export default function Setup() {
  return (
    <section
      id="install"
      className="bg-[var(--bg-secondary)] px-4 py-32 text-center"
    >
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <h2 className="mb-12 font-serif text-3xl font-normal text-[var(--text-primary)] md:text-5xl">
            Up in two steps.
          </h2>
        </FadeIn>

        <SetupStep
          number="step 01"
          heading="Start Supermemory Local"
          command="npx supermemory setup"
          note="Runs the full memory layer on your machine. One command, nothing else needed."
          delay={0}
        />

        <SetupStep
          number="step 02"
          heading="Install Mnemix"
          command="npm install -g mnemix && mnemix install"
          note="Hooks into your shell. Restart your terminal once and it runs from that point forward."
          delay={0.1}
        />
      </div>
    </section>
  )
}

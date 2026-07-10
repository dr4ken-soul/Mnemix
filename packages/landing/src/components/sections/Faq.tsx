import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import FadeIn from '../ui/FadeIn'

const faqs = [
  {
    question: 'Does Mnemix support bash, zsh and fish?',
    answer:
      'Mnemix supports zsh and bash at launch. Fish shell support is on the roadmap but is not in the current release.',
  },
  {
    question: 'Does my command history ever leave my machine?',
    answer:
      'No. Mnemix writes everything to Supermemory Local which runs entirely on your machine. No data is sent to any remote server.',
  },
  {
    question:
      'Do I need Supermemory Local running all the time or just when I use Mnemix?',
    answer:
      'Supermemory Local needs to be running for Mnemix to store and search fixes. If it is not running, Mnemix degrades silently and queues captures locally until the server is back up.',
  },
  {
    question: 'What happens when I run a command Mnemix has never seen before?',
    answer:
      'Nothing. Mnemix is silent when it has no relevant match. Your terminal behaves exactly as it would without Mnemix installed.',
  },
  {
    question: 'Can I use Mnemix without an internet connection?',
    answer:
      'Yes. Supermemory Local and Mnemix both run entirely offline. An internet connection is only needed to install the packages initially.',
  },
  {
    question: 'How does Mnemix decide which past fix is relevant?',
    answer:
      "It uses Supermemory Local's semantic search which compares the meaning of the failing command and error output against stored fixes. Only matches above a relevance threshold are shown. Low-confidence results are discarded silently.",
  },
] as const

/**
 * Accordion FAQ with one open item at a time.
 * Plus icon rotates 45 degrees when open to form an ×.
 * Hover colour shift is CSS-class based.
 */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  /**
   * Toggles the open FAQ row. Opens a new row or closes the current one.
   * @param index - FAQ item index
   */
  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section className="bg-[var(--bg-primary)] px-4 py-32">
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <h2 className="mb-12 text-center font-serif text-3xl font-normal text-[var(--text-primary)] md:text-5xl">
            Common questions.
          </h2>
        </FadeIn>

        <div>
          {faqs.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <FadeIn key={item.question} delay={index * 0.04}>
                <div className="border-b border-[var(--border-subtle)]">
                  <button
                    type="button"
                    className="faq-trigger group flex w-full cursor-pointer items-center justify-between py-5 text-left"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question pr-4 font-sans text-base text-[var(--text-primary)]">
                      {item.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="faq-icon shrink-0 text-[var(--text-secondary)]"
                    >
                      <Plus size={20} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={index}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="pb-5 font-sans text-sm font-light leading-relaxed text-[var(--text-secondary)]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

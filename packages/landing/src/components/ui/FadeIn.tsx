import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * Blur-in entrance when the element enters the viewport.
 * Replays each time the element leaves and re-enters (once: false).
 * @param children - content to animate
 * @param delay - entrance delay in seconds
 * @param className - optional class names on the motion wrapper
 */
export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: false, amount: 0.25, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

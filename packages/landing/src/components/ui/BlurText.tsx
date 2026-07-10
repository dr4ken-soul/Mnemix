import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface BlurTextProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'p'
}

/**
 * Blur-in text entrance for hero and section headlines.
 * @param children - text content
 * @param delay - entrance delay in seconds
 * @param className - optional class names
 * @param as - element tag to render
 */
export default function BlurText({
  children,
  delay = 0,
  className,
  as = 'span',
}: BlurTextProps) {
  const Component = motion[as]

  return (
    <Component
      className={className}
      initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Component>
  )
}

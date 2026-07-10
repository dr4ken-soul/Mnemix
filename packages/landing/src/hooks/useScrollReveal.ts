import { useInView } from 'motion/react'
import { useRef } from 'react'

/**
 * Returns a ref and in-view flag for scroll-triggered reveals.
 * Viewport fires once when the element crosses the threshold.
 * @param margin - root margin string for earlier or later triggers
 * @returns ref to attach and whether the element is in view
 */
export function useScrollReveal(margin = '0px 0px -40px 0px' as const) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.25, margin })

  return { ref, isInView }
}

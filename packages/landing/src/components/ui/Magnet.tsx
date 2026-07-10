import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  className?: string
}

/**
 * Magnetic hover wrapper for primary CTAs.
 * Pulls the element slightly toward the cursor using motion values.
 * Max pull distance is 6px.
 * @param children - CTA content to wrap
 * @param className - optional class names
 */
export default function Magnet({ children, className }: MagnetProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 300, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 300, damping: 20 })
  const x = useTransform(springX, [-1, 1], [-6, 6])
  const y = useTransform(springY, [-1, 1], [-6, 6])

  /**
   * Tracks cursor position relative to the magnet bounds.
   * @param e - pointer move event
   */
  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1
    mouseX.set(px)
    mouseY.set(py)
  }

  /**
   * Resets magnetic pull when the pointer leaves.
   */
  function handlePointerLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      tabIndex={-1}
    >
      <div className="magnet-focus inline-flex rounded-full">{children}</div>
    </motion.div>
  )
}

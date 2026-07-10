import { useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'

/**
 * Returns x and y motion values that respond to mouse position.
 * Used for the hero image parallax effect.
 * @param strength - how many pixels the image shifts at maximum mouse offset
 * @returns object with x and y MotionValues
 */
export function useParallax(strength = 12) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const x = useTransform(mouseX, [-1, 1], [-strength, strength])
  const y = useTransform(mouseY, [-1, 1], [-strength, strength])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1)
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return { x, y }
}

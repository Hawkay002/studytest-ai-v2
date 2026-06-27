import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

/**
 * Per-route motion wrapper. Fades + lifts content in on mount. Honors
 * prefers-reduced-motion by rendering a plain div.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <div>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

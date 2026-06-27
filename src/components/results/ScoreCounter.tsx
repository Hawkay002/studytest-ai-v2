import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

/**
 * Counts up from 0 to `target` over ~1s using requestAnimationFrame.
 * Falls back to the final value immediately when reduced motion is requested.
 */
export function ScoreCounter({
  target,
  durationMs = 1000,
  className,
}: {
  target: number
  durationMs?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (reduce) {
      setValue(target)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, durationMs, reduce])

  return <span className={className}>{value}</span>
}

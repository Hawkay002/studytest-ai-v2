import { motion, useReducedMotion } from "motion/react"

import { ScoreCounter } from "@/components/results/ScoreCounter"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  total: number
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ringColor(pct: number): string {
  if (pct >= 90) return "stroke-green-500"
  if (pct >= 75) return "stroke-primary"
  if (pct >= 60) return "stroke-yellow-500"
  return "stroke-red-500"
}

export function ScoreRing({ score, total }: ScoreRingProps) {
  const reduce = useReducedMotion()
  const pct = total > 0 ? (score / total) * 100 : 0
  const offset = CIRCUMFERENCE * (1 - pct / 100)

  return (
    <div className="relative h-40 w-40">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Score ${score} of ${total}`}
      >
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          className={cn(ringColor(pct))}
          initial={reduce ? false : { strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 60, damping: 18, duration: 1.2 }
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">
          <ScoreCounter target={pct >= 0 ? Math.round(pct) : 0} durationMs={900} />
          <span className="text-lg">%</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {score} / {total}
        </span>
      </div>
    </div>
  )
}

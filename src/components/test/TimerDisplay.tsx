import { AlertTriangle, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  formattedTime: string
  totalSeconds: number
  timeLeft: number
}

const LOW_THRESHOLD = 5 * 60 // 5 min
const CRITICAL_THRESHOLD = 2 * 60 // 2 min

export function TimerDisplay({
  formattedTime,
  totalSeconds,
  timeLeft,
}: TimerDisplayProps) {
  if (totalSeconds <= 0) return null

  const low = timeLeft <= LOW_THRESHOLD
  const critical = timeLeft <= CRITICAL_THRESHOLD

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-sm font-semibold tabular-nums",
        critical
          ? "animate-pulse text-red-600 dark:text-red-500"
          : low
            ? "text-amber-600 dark:text-amber-500"
            : "text-foreground",
      )}
    >
      {(low || critical) && <AlertTriangle className="h-4 w-4" />}
      <Clock className={cn((low || critical) && "hidden", "h-4 w-4")} />
      {formattedTime}
    </span>
  )
}

import { cn } from "@/lib/utils"

interface QuestionProgressBarProps {
  answered: number
  total: number
  current: number // 1-based
}

function barColor(pct: number): string {
  if (pct >= 80) return "bg-green-500"
  if (pct >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

export function QuestionProgressBar({
  answered,
  total,
  current,
}: QuestionProgressBarProps) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
            barColor(pct),
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {answered}/{total} answered &middot; Q{current} of {total}
      </span>
    </div>
  )
}

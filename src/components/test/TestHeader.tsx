import { BookOpen } from "lucide-react"

import { TimerDisplay } from "@/components/test/TimerDisplay"
import { QuestionProgressBar } from "@/components/test/QuestionProgressBar"

interface TestHeaderProps {
  topic: string
  answered: number
  total: number
  current: number
  timer?: {
    formattedTime: string
    totalSeconds: number
    timeLeft: number
  }
}

export function TestHeader({
  topic,
  answered,
  total,
  current,
  timer,
}: TestHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container space-y-2 py-2.5">
        {/* Row 1 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium" title={topic}>
              {topic}
            </span>
          </div>
          {timer && (
            <TimerDisplay
              formattedTime={timer.formattedTime}
              totalSeconds={timer.totalSeconds}
              timeLeft={timer.timeLeft}
            />
          )}
        </div>

        {/* Row 2 (progress) */}
        <QuestionProgressBar
          answered={answered}
          total={total}
          current={current}
        />
      </div>
    </header>
  )
}

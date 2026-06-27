import { ChevronLeft, ChevronRight, ChevronUp, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface QuestionNavBarProps {
  current: number // 1-based
  total: number
  isLast: boolean
  onPrev?: () => void
  onNext?: () => void
  onSubmit?: () => void
  onOpenMap?: () => void
}

export function QuestionNavBar({
  current,
  total,
  isLast,
  onPrev,
  onNext,
  onSubmit,
  onOpenMap,
}: QuestionNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center gap-2 border-t bg-background px-4 sm:hidden">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={!onPrev}
        aria-label="Previous question"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        className="flex-1 gap-1.5"
        onClick={onOpenMap}
      >
        Q{current} / {total}
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </Button>

      {isLast ? (
        <Button onClick={onSubmit} className="gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          Submit
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!onNext}
          size="icon"
          aria-label="Next question"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </nav>
  )
}

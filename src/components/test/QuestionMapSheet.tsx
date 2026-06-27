import { CheckCircle2 } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuestionMapSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  current: number // 1-based
  answeredIds: Set<number>
  onJump: (index: number) => void
  onSubmit: () => void
}

export function QuestionMapSheet({
  open,
  onOpenChange,
  total,
  current,
  answeredIds,
  onJump,
  onSubmit,
}: QuestionMapSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Your progress</SheetTitle>
          <SheetDescription>
            {answeredIds.size} of {total} answered. Tap a question to jump.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1
            const isCurrent = n === current
            const isAnswered = answeredIds.has(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => onJump(i)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCurrent
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent",
                  isAnswered
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isAnswered ? <CheckCircle2 className="h-4 w-4" /> : n}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" />
            Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-muted" />
            Not answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-primary" />
            Current
          </span>
        </div>

        <Button className="mt-6 w-full" onClick={onSubmit}>
          Submit Test
        </Button>
      </SheetContent>
    </Sheet>
  )
}

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const MAX = 2000

interface LongAnswerBoxProps {
  value: string
  onChange: (next: string) => void
}

export function LongAnswerBox({ value, onChange }: LongAnswerBoxProps) {
  const count = value.length
  return (
    <div className="space-y-2">
      <Label htmlFor="long-answer" className="sr-only">
        Your answer
      </Label>
      <Textarea
        id="long-answer"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder="Type your detailed answer..."
        className="min-h-48 resize-y"
      />
      <div className="flex justify-end">
        <span
          className={cn(
            "text-xs tabular-nums",
            count >= 1900
              ? "text-red-600 dark:text-red-500"
              : count >= 1700
                ? "text-amber-600 dark:text-amber-500"
                : "text-muted-foreground",
          )}
        >
          {count} / {MAX}
        </span>
      </div>
    </div>
  )
}
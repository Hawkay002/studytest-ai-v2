import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const MAX = 500

interface ShortAnswerBoxProps {
  value: string
  onChange: (next: string) => void
}

export function ShortAnswerBox({ value, onChange }: ShortAnswerBoxProps) {
  const count = value.length
  return (
    <div className="space-y-2">
      <Label htmlFor="short-answer" className="sr-only">
        Your answer
      </Label>
      <Textarea
        id="short-answer"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder="Type your answer..."
        className="min-h-32 resize-y"
      />
      <div className="flex justify-end">
        <span
          className={cn(
            "text-xs tabular-nums",
            count >= 490
              ? "text-red-600 dark:text-red-500"
              : count >= 450
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

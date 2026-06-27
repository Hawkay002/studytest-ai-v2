import { Info } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const MAX = 300

interface ContextTextareaProps {
  value: string
  onChange: (next: string) => void
}

export function ContextTextarea({ value, onChange }: ContextTextareaProps) {
  const count = value.length
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
        Additional context (optional)
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder="e.g. These are pages from Chapter 5, Biology Grade 10..."
        className="min-h-20 resize-y"
      />
      <div className="flex justify-end">
        <span
          className={cn(
            "text-xs tabular-nums",
            count > MAX - 20 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground",
          )}
        >
          {count} / {MAX}
        </span>
      </div>
    </div>
  )
}

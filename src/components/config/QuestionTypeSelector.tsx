import { ListChecks, PenLine, TextCursorInput, ToggleLeft, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { QuestionType } from "@/types/test"

interface QuestionTypeSelectorProps {
  value: QuestionType[]
  onChange: (next: QuestionType[]) => void
}

const OPTIONS: {
  type: QuestionType
  label: string
  icon: LucideIcon
}[] = [
  { type: "mcq", label: "Multiple Choice", icon: ListChecks },
  { type: "true_false", label: "True / False", icon: ToggleLeft },
  { type: "fill_blank", label: "Fill in Blank", icon: TextCursorInput },
  { type: "short_answer", label: "Short Answer", icon: PenLine },
  { type: "long_answer", label: "Long Answer", icon: FileText },
]

export function QuestionTypeSelector({
  value,
  onChange,
}: QuestionTypeSelectorProps) {
  const toggle = (type: QuestionType) => {
    // Prevent deselecting the last remaining type.
    if (value.includes(type)) {
      if (value.length === 1) return
      onChange(value.filter((t) => t !== type))
    } else {
      onChange([...value, type])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map(({ type, label, icon: Icon }) => {
        const selected = value.includes(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            aria-pressed={selected}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all active:scale-[0.98]",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/50",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
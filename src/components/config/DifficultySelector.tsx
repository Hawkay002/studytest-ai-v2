import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Difficulty } from "@/types/test"
import { cn } from "@/lib/utils"

interface DifficultySelectorProps {
  value: Difficulty
  onChange: (next: Difficulty) => void
}

const OPTIONS: {
  value: Difficulty
  label: string
  className: string
}[] = [
  {
    value: "easy",
    label: "Easy",
    className:
      "data-[state=on]:bg-green-500/10 data-[state=on]:text-green-600 data-[state=on]:border-green-500 dark:data-[state=on]:text-green-500",
  },
  {
    value: "medium",
    label: "Medium",
    className:
      "data-[state=on]:bg-yellow-500/10 data-[state=on]:text-yellow-600 data-[state=on]:border-yellow-500 dark:data-[state=on]:text-yellow-500",
  },
  {
    value: "hard",
    label: "Hard",
    className:
      "data-[state=on]:bg-red-500/10 data-[state=on]:text-red-600 data-[state=on]:border-red-500 dark:data-[state=on]:text-red-500",
  },
  {
    value: "mixed",
    label: "Mixed",
    className:
      "data-[state=on]:bg-purple-500/10 data-[state=on]:text-purple-600 data-[state=on]:border-purple-500 dark:data-[state=on]:text-purple-500",
  },
]

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as Difficulty)
      }}
      className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {OPTIONS.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          variant="outline"
          className={cn("h-9 justify-center", opt.className)}
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

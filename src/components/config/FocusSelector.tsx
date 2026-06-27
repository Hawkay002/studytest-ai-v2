import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target } from "lucide-react"
import type { StudyFocus } from "@/types/test"

interface FocusSelectorProps {
  value: StudyFocus
  onChange: (next: StudyFocus) => void
}

const OPTIONS: { value: StudyFocus; label: string }[] = [
  { value: "concepts", label: "Core Concepts" },
  { value: "definitions", label: "Definitions" },
  { value: "dates", label: "Dates & Timeline" },
  { value: "cause_effect", label: "Cause & Effect" },
  { value: "application", label: "Application" },
  { value: "critical_analysis", label: "Critical Analysis" },
  { value: "synthesis", label: "Synthesis" },
  { value: "mixed", label: "Mixed (all of the above)" },
]

export function FocusSelector({ value, onChange }: FocusSelectorProps) {
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={(v) => onChange(v as StudyFocus)}>
        <SelectTrigger>
          <span className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Study focus" />
          </span>
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
import { AnimatePresence } from "motion/react"
import { Hash, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TopicChip } from "@/components/input/TopicChip"

const SEP = "|"

const QUICK_ADD = ["Chapter 1", "Introduction", "Key Terms", "Summary"]

interface TopicChipInputProps {
  value: string // pipe-joined topics
  onChange: (next: string) => void
}

function parse(value: string): string[] {
  return value
    .split(SEP)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function TopicChipInput({ value, onChange }: TopicChipInputProps) {
  const chips = parse(value)

  const commit = (next: string[]) =>
    onChange(next.map((c) => c.trim()).filter(Boolean).join(` ${SEP} `))

  const addChip = (raw: string) => {
    const label = raw.trim()
    if (!label) return
    if (chips.some((c) => c.toLowerCase() === label.toLowerCase())) return
    commit([...chips, label])
  }

  const removeChip = (label: string) =>
    commit(chips.filter((c) => c !== label))

  return (
    <div className="space-y-3">
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-input bg-transparent p-2">
        <AnimatePresence mode="popLayout">
          {chips.map((chip) => (
            <TopicChip
              key={chip}
              label={chip}
              onRemove={() => removeChip(chip)}
            />
          ))}
        </AnimatePresence>

        <Input
          type="text"
          placeholder="Type a topic and press Enter..."
          className="h-8 min-w-[180px] flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              const target = e.target as HTMLInputElement
              addChip(target.value)
              target.value = ""
            }
            if (e.key === "Backspace" && e.currentTarget.value === "") {
              const last = chips[chips.length - 1]
              if (last) removeChip(last)
            }
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Hash className="h-3 w-3" />
          Quick add:
        </span>
        {QUICK_ADD.map((label) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => addChip(label)}
          >
            <Plus className="h-3 w-3" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

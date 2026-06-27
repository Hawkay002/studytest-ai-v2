import { useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface MCQOptionsProps {
  options: string[] // ['A. ...', 'B. ...', ...]
  selected: string // 'A' | 'B' | 'C' | 'D' | ''
  onSelect: (letter: string) => void
}

function optionLetter(option: string): string {
  const m = /^([A-D])/i.exec(option.trim())
  return m ? m[1].toUpperCase() : ""
}

function optionText(option: string): string {
  return option.replace(/^[A-D][\).:\s]+/i, "").trim()
}

export function MCQOptions({ options, selected, onSelect }: MCQOptionsProps) {
  // Keyboard: 1-4 map to A-D.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      const map: Record<string, string> = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
        a: "A",
        b: "B",
        c: "C",
        d: "D",
      }
      const letter = map[e.key.toLowerCase()]
      if (letter && options.some((o) => optionLetter(o) === letter)) {
        onSelect(letter)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [options, onSelect])

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const letter = optionLetter(option)
        const isSelected = selected === letter
        return (
          <button
            key={letter || option}
            type="button"
            onClick={() => onSelect(letter)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all active:scale-[0.99]",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {letter}
            </span>
            <span className="flex-1">{optionText(option)}</span>
            {isSelected && (
              <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}

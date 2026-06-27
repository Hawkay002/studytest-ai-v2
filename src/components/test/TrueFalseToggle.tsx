import { useEffect } from "react"
import { CheckCircle2, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

interface TrueFalseToggleProps {
  selected: string // 'True' | 'False' | ''
  onSelect: (value: "True" | "False") => void
}

export function TrueFalseToggle({ selected, onSelect }: TrueFalseToggleProps) {
  // Keyboard: t/ArrowLeft -> True, f/ArrowRight -> False.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      const key = e.key.toLowerCase()
      if (key === "t" || key === "arrowleft") onSelect("True")
      else if (key === "f" || key === "arrowright") onSelect("False")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onSelect])

  const isTrue = selected === "True"
  const isFalse = selected === "False"

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect("True")}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all active:scale-[0.98]",
          isTrue
            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-500"
            : "border-border hover:border-green-500/50",
        )}
      >
        <CheckCircle2 className="h-7 w-7" />
        <span className="font-semibold">TRUE</span>
      </button>

      <button
        type="button"
        onClick={() => onSelect("False")}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all active:scale-[0.98]",
          isFalse
            ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-500"
            : "border-border hover:border-red-500/50",
        )}
      >
        <XCircle className="h-7 w-7" />
        <span className="font-semibold">FALSE</span>
      </button>
    </div>
  )
}

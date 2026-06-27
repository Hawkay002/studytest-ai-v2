import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AppStep } from "@/types/test"

interface StepIndicatorProps {
  current: AppStep
}

const STEPS: {
  key: AppStep
  label: string
}[] = [
  { key: "input", label: "Add Content" },
  { key: "config", label: "Configure" },
  { key: "generating", label: "Generate" },
]

function stepIndex(step: AppStep): number {
  if (step === "input") return 0
  if (step === "config") return 1
  return 2
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const reduce = useReducedMotion()
  const activeIdx = stepIndex(current)

  return (
    <div className="mx-auto flex w-full max-w-md items-center">
      {STEPS.map((step, i) => {
        const isActive = i === activeIdx
        const isDone = i < activeIdx
        const isGenerating = step.key === "generating" && isActive

        return (
          <div
            key={step.key}
            className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground",
                  isDone &&
                    "border-green-500 bg-green-500 text-white",
                  !isActive && !isDone && "border-border text-muted-foreground",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isGenerating ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive || isDone
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={false}
                  animate={{ width: i < activeIdx ? "100%" : "0%" }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
                  }
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

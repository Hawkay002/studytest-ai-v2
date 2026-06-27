import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const MESSAGES = [
  "Reading your content...",
  "Identifying key concepts...",
  "Crafting questions...",
  "Writing answer explanations...",
  "Finalizing your test...",
]

export function LoadingOverlay({ onCancel }: { onCancel: () => void }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />

        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              {MESSAGES[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

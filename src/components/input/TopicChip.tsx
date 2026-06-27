import { motion, useReducedMotion } from "motion/react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TopicChipProps {
  label: string
  onRemove: () => void
}

export function TopicChip({ label, onRemove }: TopicChipProps) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      layout
      initial={reduce ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.18 }}
    >
      <Badge variant="secondary" className={cn("gap-1 py-1 pr-1.5 pl-2.5")}>
        <span className="text-muted-foreground">#</span>
        <span>{label}</span>
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    </motion.span>
  )
}

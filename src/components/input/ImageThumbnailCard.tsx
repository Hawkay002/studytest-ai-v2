import { motion, useReducedMotion } from "motion/react"
import { FileWarning, ImageIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatBytes } from "@/lib/imageUtils"

export interface ThumbnailData {
  id: string
  name: string
  dataUrl: string
  bytes: number
  compressed: boolean
}

interface ImageThumbnailCardProps {
  data: ThumbnailData
  onRemove: () => void
}

export function ImageThumbnailCard({
  data,
  onRemove,
}: ImageThumbnailCardProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative overflow-hidden rounded-lg border bg-card"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {data.dataUrl ? (
          <img
            src={data.dataUrl}
            alt={data.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <FileWarning className="h-6 w-6" />
          </div>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${data.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {data.compressed && (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            compressed
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-xs" title={data.name}>
          {data.name}
        </span>
        <span className={cn("shrink-0 text-[10px] text-muted-foreground")}>
          {formatBytes(data.bytes)}
        </span>
      </div>
    </motion.div>
  )
}

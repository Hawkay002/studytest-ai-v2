import { AnimatePresence } from "motion/react"
import { ImagePlus } from "lucide-react"

import { ImageThumbnailCard, type ThumbnailData } from "@/components/input/ImageThumbnailCard"

interface ImageThumbnailGridProps {
  images: ThumbnailData[]
  onRemove: (id: string) => void
  onAddMore: () => void
  maxReached: boolean
}

export function ImageThumbnailGrid({
  images,
  onRemove,
  onAddMore,
  maxReached,
}: ImageThumbnailGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {images.map((img) => (
          <ImageThumbnailCard
            key={img.id}
            data={img}
            onRemove={() => onRemove(img.id)}
          />
        ))}
      </AnimatePresence>

      {!maxReached && (
        <button
          type="button"
          onClick={onAddMore}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs font-medium">Add more</span>
        </button>
      )}
    </div>
  )
}

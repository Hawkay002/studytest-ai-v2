import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ListChecks,
  PenLine,
  TextCursorInput,
  ToggleLeft,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MCQOptions } from "@/components/test/MCQOptions"
import { TrueFalseToggle } from "@/components/test/TrueFalseToggle"
import { FillBlankInput } from "@/components/test/FillBlankInput"
import { ShortAnswerBox } from "@/components/test/ShortAnswerBox"
import { LongAnswerBox } from "@/components/test/LongAnswerBox"
import { cn } from "@/lib/utils"
import type {
  Difficulty,
  FillBlankQuestion,
  MCQQuestion,
  Question,
} from "@/types/test"

const TYPE_ICON: Record<Question["type"], LucideIcon> = {
  mcq: ListChecks,
  true_false: ToggleLeft,
  fill_blank: TextCursorInput,
  short_answer: PenLine,
  long_answer: FileText,
}

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in Blank",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
}

const DIFFICULTY_STYLE: Record<
  Exclude<Difficulty, "mixed">,
  { dot: string; label: string }
> = {
  easy: { dot: "bg-green-500", label: "Easy" },
  medium: { dot: "bg-yellow-500", label: "Medium" },
  hard: { dot: "bg-red-500", label: "Hard" },
}

interface QuestionCardProps {
  question: Question
  index: number // 1-based
  total: number
  answer: string
  onAnswer: (value: string) => void
  onPrev?: () => void
  onNext?: () => void
  isLast: boolean
  onSubmit?: () => void
  onAddImage?: (imageDataUrl: string) => void
  onRemoveImage?: (imageIndex: number) => void
  images?: string[]
}

export function QuestionCard({
  question,
  index,
  total,
  answer,
  onAnswer,
  onPrev,
  onNext,
  isLast,
  onSubmit,
  onAddImage,
  onRemoveImage,
  images = [],
}: QuestionCardProps) {
  const TypeIcon = TYPE_ICON[question.type]
  const difficulty = question.difficulty
    ? DIFFICULTY_STYLE[question.difficulty]
    : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Badge variant="secondary">Q{index}</Badge>
        {difficulty && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className={cn("h-2 w-2 rounded-full", difficulty.dot)} />
            {difficulty.label}
          </Badge>
        )}
        <Badge variant="outline" className="ml-auto gap-1.5 font-normal">
          <TypeIcon className="h-3.5 w-3.5" />
          {TYPE_LABEL[question.type]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-lg font-medium leading-relaxed">
          {question.question}
        </p>

        <QuestionInput
          question={question}
          answer={answer}
          onAnswer={onAnswer}
          onAddImage={onAddImage}
          onRemoveImage={onRemoveImage}
          images={images}
        />
      </CardContent>

      {/* Desktop nav */}
      <CardFooter className="hidden items-center justify-between border-t pt-4 sm:flex">
        <Button
          variant="ghost"
          onClick={onPrev}
          disabled={!onPrev}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {index} / {total}
        </span>
        {isLast ? (
          <Button onClick={onSubmit} className="gap-1.5">
            Submit Test
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!onNext} className="gap-1.5">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function QuestionInput({
  question,
  answer,
  onAnswer,
  onAddImage,
  onRemoveImage,
  images = [],
}: {
  question: Question
  answer: string
  onAnswer: (value: string) => void
  onAddImage?: (imageDataUrl: string) => void
  onRemoveImage?: (imageIndex: number) => void
  images?: string[]
}) {
  const hasImageUpload = onAddImage && onRemoveImage

  switch (question.type) {
    case "mcq":
      return (
        <MCQOptions
          options={(question as MCQQuestion).options}
          selected={answer}
          onSelect={onAnswer}
        />
      )
    case "true_false":
      return (
        <TrueFalseToggle
          selected={answer}
          onSelect={onAnswer as (v: "True" | "False") => void}
        />
      )
    case "fill_blank":
      return (
        <FillBlankInput
          question={(question as FillBlankQuestion).question}
          value={answer}
          onChange={onAnswer}
        />
      )
    case "short_answer":
      return (
        <div className="space-y-4">
          <ShortAnswerBox
            value={answer}
            onChange={onAnswer}
          />
          {hasImageUpload && (
            <ImageUploadSection
              onAddImage={onAddImage!}
              onRemoveImage={onRemoveImage!}
              images={images}
            />
          )}
        </div>
      )
    case "long_answer":
      return (
        <div className="space-y-4">
          <LongAnswerBox
            value={answer}
            onChange={onAnswer}
          />
          {hasImageUpload && (
            <ImageUploadSection
              onAddImage={onAddImage!}
              onRemoveImage={onRemoveImage!}
              images={images}
            />
          )}
        </div>
      )
    // satisfies the discriminated union exhaustiveness
    default:
      return null
  }
}

function ImageUploadSection({
  onAddImage,
  onRemoveImage,
  images,
}: {
  onAddImage: (imageDataUrl: string) => void
  onRemoveImage: (imageIndex: number) => void
  images: string[]
}) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onAddImage(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onAddImage(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Camera className="h-4 w-4" />
        <span>Handwritten Answer Upload</span>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
        )}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="sr-only"
          id="answer-image-upload"
        />
        <label
          htmlFor="answer-image-upload"
          className="flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm">Drag & drop or click to upload</span>
          <span className="text-xs text-muted-foreground">Images & PDFs up to 10MB</span>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((dataUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border">
                {dataUrl.startsWith("data:image/") ? (
                  <img src={dataUrl} alt={`Answer ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
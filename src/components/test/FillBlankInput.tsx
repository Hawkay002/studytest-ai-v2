import { Input } from "@/components/ui/input"

interface FillBlankInputProps {
  question: string // contains "___"
  value: string
  onChange: (next: string) => void
}

/**
 * Renders the question with the blank replaced by an inline text input.
 * The blank is identified by the first occurrence of "___" (3+ underscores).
 */
export function FillBlankInput({
  question,
  value,
  onChange,
}: FillBlankInputProps) {
  const parts = question.split(/_{3,}/)

  return (
    <p className="flex flex-wrap items-center gap-1 text-lg font-medium leading-relaxed">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <Input
              value={i === 0 ? value : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="answer"
              className="mx-1 inline-block h-9 w-32 border-0 border-b-2 rounded-none bg-transparent px-1 text-primary focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label={`Blank ${i + 1}`}
            />
          )}
        </span>
      ))}
    </p>
  )
}

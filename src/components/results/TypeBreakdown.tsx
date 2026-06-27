import type { Question, QuestionType, TestResult } from "@/types/test"
import { cn } from "@/lib/utils"

const TYPE_LABEL: Record<QuestionType, string> = {
  mcq: "MCQ",
  true_false: "True / False",
  fill_blank: "Fill in Blank",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
}

interface TypeBreakdownProps {
  questions: Question[]
  result: TestResult
}

interface Bucket {
  type: QuestionType
  total: number
  totalMarks: number
  earnedMarks: number
}

function bucketize(questions: Question[], result: TestResult): Bucket[] {
  const byId = new Map(result.answers.map((a) => [a.questionId, a]))
  const map = new Map<QuestionType, Bucket>()
  for (const q of questions) {
    const bucket =
      map.get(q.type) ?? { type: q.type, total: 0, totalMarks: 0, earnedMarks: 0 }
    bucket.total += 1
    bucket.totalMarks += q.marks
    const answer = byId.get(q.id)
    if (answer) {
      bucket.earnedMarks += answer.score
    }
    map.set(q.type, bucket)
  }
  return Array.from(map.values())
}

export function TypeBreakdown({ questions, result }: TypeBreakdownProps) {
  const buckets = bucketize(questions, result)
  if (buckets.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Breakdown by type
      </p>
      <div className="space-y-2.5">
        {buckets.map((b) => {
          const pct = b.totalMarks > 0 ? Math.round((b.earnedMarks / b.totalMarks) * 100) : 0
          return (
            <div key={b.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{TYPE_LABEL[b.type]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {b.earnedMarks}/{b.totalMarks} &middot; {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-all",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
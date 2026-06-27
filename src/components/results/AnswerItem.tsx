import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  CheckCircle2,
  ChevronDown,
  Info,
  XCircle,
  Star,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Question, UserAnswer } from "@/types/test"

interface AnswerItemProps {
  question: Question
  index: number // 1-based
  userAnswer: UserAnswer
}

function displayAnswer(question: Question): string {
  switch (question.type) {
    case "mcq": {
      const match = question.options.find((o) => o.startsWith(question.answer))
      return match ?? question.answer
    }
    case "true_false":
    case "fill_blank":
    case "short_answer":
    case "long_answer":
      return question.answer
    default:
      return ""
  }
}

function getScoreBgColor(score: number, maxMarks: number): string {
  if (score === maxMarks) return "bg-green-500/10 text-green-700 dark:text-green-400"
  if (score > 0) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
  return "bg-red-500/10 text-red-700 dark:text-red-400"
}

export function AnswerItem({ question, index, userAnswer }: AnswerItemProps) {
  const [expanded, setExpanded] = useState(false)
  const reduce = useReducedMotion()
  const given = userAnswer.answer
  const expected = displayAnswer(question)
  const score = userAnswer.score
  const maxMarks = userAnswer.maxMarks
  const isFullMarks = score === maxMarks
  const isPartial = score > 0 && score < maxMarks
  const showCorrectRow = !isFullMarks && given.trim() !== expected.trim()

  const scoreBgColor = getScoreBgColor(score, maxMarks)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border-l-4 bg-card p-4 shadow-sm",
        isFullMarks
          ? "border-green-500"
          : isPartial
            ? "border-yellow-500"
            : "border-red-500",
      )}
    >
      <div className="flex items-start gap-2">
        <Badge variant="secondary" className="shrink-0">
          Q{index}
        </Badge>
        {isFullMarks ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
        ) : isPartial ? (
          <Star className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
        ) : (
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        )}
        <p className="flex-1 font-medium leading-relaxed">
          {question.question}
        </p>
      </div>

      <div className="mt-3 space-y-1.5 pl-6 text-sm">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-muted-foreground">Your answer:</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5",
              isFullMarks
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : isPartial
                  ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                  : "bg-muted text-foreground",
              !given && "italic text-muted-foreground",
            )}
          >
            {given || "(blank)"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Score:</span>
          <span className={cn("rounded px-1.5 py-0.5 font-semibold", scoreBgColor)}>
            {score} / {maxMarks}
          </span>
        </div>

        {showCorrectRow && (
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-muted-foreground">Model answer:</span>
            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-green-700 dark:text-green-400">
              {expected}
            </span>
          </div>
        )}
      </div>

      {userAnswer.feedback && (
        <div className="mt-3 pl-6">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-semibold text-muted-foreground mb-1">AI Feedback:</p>
            <p className="text-foreground">{userAnswer.feedback}</p>
          </div>
        </div>
      )}

      {question.explanation && (
        <div className="mt-3 pl-6">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Info className="h-3.5 w-3.5" />
            Explanation
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="content"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
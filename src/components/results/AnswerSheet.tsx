import { AnswerItem } from "@/components/results/AnswerItem"
import type { GeneratedTest, TestResult } from "@/types/test"

interface AnswerSheetProps {
  test: GeneratedTest
  result: TestResult
}

export function AnswerSheet({ test, result }: AnswerSheetProps) {
  const byId = new Map(result.answers.map((a) => [a.questionId, a]))

  return (
    <div className="space-y-4">
      {test.sections.map(section => (
        <div key={section.id} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
            <span>{section.name}</span>
            <span className="text-primary">{section.description}</span>
          </div>
          {section.questions.map((question, i) => (
            <AnswerItem
              key={question.id}
              question={question}
              index={i + 1}
              userAnswer={
                byId.get(question.id) ?? {
                  questionId: question.id,
                  answer: "",
                  score: 0,
                  maxMarks: question.marks,
                  feedback: "",
                }
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}
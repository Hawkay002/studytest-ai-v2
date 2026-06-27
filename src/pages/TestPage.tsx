import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useParams } from "wouter"
import { toast } from "sonner"
import { FileQuestion, Loader2 } from "lucide-react"

import { TestHeader } from "@/components/test/TestHeader"
import { QuestionCard } from "@/components/test/QuestionCard"
import { QuestionNavBar } from "@/components/test/QuestionNavBar"
import { QuestionMapSheet } from "@/components/test/QuestionMapSheet"
import { SubmitDialog } from "@/components/test/SubmitDialog"
import { EmptyState } from "@/components/common/EmptyState"
import { useApp } from "@/context/AppContext"
import { useApiKey } from "@/context/ApiKeyContext"
import { useTestHistory } from "@/hooks/useTestHistory"
import { useTimer } from "@/hooks/useTimer"
import { gradeSemantic, gradeTest } from "@/lib/gemini"
import { dataUrlToInlinePart } from "@/lib/imageUtils"
import { getAllQuestions } from "@/lib/utils"
import { PageTransition } from "@/components/layout/PageTransition"
import type { GeneratedTest, TestResult } from "@/types/test"

const SEMANTIC_TYPES = new Set(["short_answer", "long_answer", "fill_blank"])

export function TestPage() {
  const params = useParams<{ id: string }>()
  const { getTest, saveResult } = useApp()
  const { apiKey } = useApiKey()
  const { addEntry } = useTestHistory()
  const [, navigate] = useLocation()

  const test = params.id ? getTest(params.id) : undefined

  const [answers, setAnswers] = useState<Record<number, { text: string; images: string[] }>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mapOpen, setMapOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [isGrading, setIsGrading] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  const allQuestions = useMemo(() => {
    if (!test) return []
    const qs: Array<{
      question: import("@/types/test").Question
      sectionId: string
      sectionName: string
      sectionRequiredCount: number
    }> = []
    test.sections.forEach(section => {
      section.questions.forEach(q => {
        qs.push({
          question: q,
          sectionId: section.id,
          sectionName: section.name,
          sectionRequiredCount: section.requiredCount,
        })
      })
    })
    return qs
  }, [test])

  const totalSeconds = useMemo(
    () =>
      test && test.config.timerEnabled ? test.config.timerMinutes * 60 : 0,
    [test],
  )

  const handleExpire = () => {
    toast.warning("Time's up!", { description: "Your test has been auto-submitted." })
    if (test) void doSubmit(test)
  }

  const timer = useTimer(totalSeconds, handleExpire)

  useEffect(() => {
    if (totalSeconds > 0) timer.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds])

  if (!test) {
    return (
      <PageTransition>
        <EmptyState
          icon={FileQuestion}
          title="Test not found"
          description="This test may have expired or was never created."
          action={{ label: "Make a new test", onClick: () => navigate("/app") }}
        />
      </PageTransition>
    )
  }

  const total = allQuestions.length
  const current = allQuestions[currentIndex]
  const currentQuestion = current?.question
  const answeredIds = new Set(
    Object.entries(answers)
      .filter(([, v]) => v.text.trim().length > 0 || v.images.length > 0)
      .map(([id]) => Number(id)),
  )
  const answeredCount = answeredIds.size
  const unansweredIndices = allQuestions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => !answeredIds.has(q.question.id))
    .map(({ i }) => i + 1)

  function setAnswer(questionId: number, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], text: value } }))
  }

  function addImageToAnswer(questionId: number, imageDataUrl: string) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        images: [...(prev[questionId]?.images || []), imageDataUrl],
      },
    }))
  }

  function removeImageFromAnswer(questionId: number, imageIndex: number) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        images: prev[questionId]?.images.filter((_, i) => i !== imageIndex) || [],
      },
    }))
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function goNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex(i => i + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function jumpTo(index: number) {
    setCurrentIndex(index)
    setMapOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function doSubmit(testToSubmit: GeneratedTest): Promise<void> {
    timer.pause()
    setIsGrading(true)

    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)

    // Start with fast local grading for all questions.
    const localResult = gradeTest(testToSubmit, answers, elapsed)
    const updatedAnswers = [...localResult.answers]

    // Upgrade open-ended answers with AI semantic grading.
    for (const q of getAllQuestions(testToSubmit)) {
      if (!SEMANTIC_TYPES.has(q.type)) continue
      const userText = answers[q.id]?.text ?? ""
      const userImages = answers[q.id]?.images ?? []
      if (!userText.trim() && !userImages.length) continue

      try {
        const userInput = userImages.length
          ? userImages.map(dataUrlToInlinePart)
          : userText
        const { score, feedback } = await gradeSemantic(
          apiKey,
          q,
          userInput,
          testToSubmit.config.language,
        )
        const idx = updatedAnswers.findIndex(a => a.questionId === q.id)
        if (idx !== -1) {
          updatedAnswers[idx] = { ...updatedAnswers[idx], score, feedback }
        }
      } catch {
        // Semantic grading failed for this question; keep the local grade.
      }
    }

    const finalScore = updatedAnswers.reduce((sum, a) => sum + a.score, 0)
    const result: TestResult = { ...localResult, answers: updatedAnswers, score: finalScore }

    saveResult(result)
    addEntry(testToSubmit, result)
    setIsGrading(false)
    navigate(`/results/${testToSubmit.id}`)
  }

  return (
    <PageTransition>
      <TestHeader
        topic={test.topic}
        answered={answeredCount}
        total={total}
        current={currentIndex + 1}
        timer={
          totalSeconds > 0
            ? {
                formattedTime: timer.formattedTime,
                totalSeconds,
                timeLeft: timer.timeLeft,
              }
            : undefined
        }
      />

      <main className="container max-w-2xl space-y-4 py-6 pb-24 sm:pb-6">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            index={currentIndex + 1}
            total={total}
            answer={answers[currentQuestion.id]?.text ?? ""}
            onAnswer={value => setAnswer(currentQuestion.id, value)}
            onPrev={currentIndex > 0 ? goPrev : undefined}
            onNext={currentIndex < total - 1 ? goNext : undefined}
            isLast={currentIndex === total - 1}
            onSubmit={() => setSubmitOpen(true)}
            onAddImage={imageDataUrl =>
              currentQuestion && addImageToAnswer(currentQuestion.id, imageDataUrl)
            }
            onRemoveImage={imageIndex =>
              currentQuestion && removeImageFromAnswer(currentQuestion.id, imageIndex)
            }
            images={answers[currentQuestion.id]?.images || []}
          />
        )}
      </main>

      <QuestionNavBar
        current={currentIndex + 1}
        total={total}
        isLast={currentIndex === total - 1}
        onPrev={currentIndex > 0 ? goPrev : undefined}
        onNext={currentIndex < total - 1 ? goNext : undefined}
        onSubmit={() => setSubmitOpen(true)}
        onOpenMap={() => setMapOpen(true)}
      />

      <QuestionMapSheet
        open={mapOpen}
        onOpenChange={setMapOpen}
        total={total}
        current={currentIndex + 1}
        answeredIds={answeredIds}
        onJump={jumpTo}
        onSubmit={() => {
          setMapOpen(false)
          setSubmitOpen(true)
        }}
      />

      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        total={total}
        unanswered={unansweredIndices}
        onConfirm={() => {
          setSubmitOpen(false)
          if (test) void doSubmit(test)
        }}
      />

      {/* AI grading overlay — shown while semantic grading runs after submission */}
      {isGrading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Grading your answers with AI…</p>
          </div>
        </div>
      )}
    </PageTransition>
  )
}

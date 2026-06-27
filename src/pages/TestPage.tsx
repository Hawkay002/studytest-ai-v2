import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useParams } from "wouter"
import { toast } from "sonner"

import { TestHeader } from "@/components/test/TestHeader"
import { QuestionCard } from "@/components/test/QuestionCard"
import { QuestionNavBar } from "@/components/test/QuestionNavBar"
import { QuestionMapSheet } from "@/components/test/QuestionMapSheet"
import { SubmitDialog } from "@/components/test/SubmitDialog"
import { EmptyState } from "@/components/common/EmptyState"
import { useApp } from "@/context/AppContext"
import { useTimer } from "@/hooks/useTimer"
import { gradeTest } from "@/lib/gemini"
import { PageTransition } from "@/components/layout/PageTransition"
import { FileQuestion } from "lucide-react"
import type {
  GeneratedTest,
  TestResult,
} from "@/types/test"

export function TestPage() {
  const params = useParams<{ id: string }>()
  const { getTest, saveResult } = useApp()
  const [, navigate] = useLocation()

  const test = params.id ? getTest(params.id) : undefined

  // Local answer state: questionId -> { text: string, images: string[] }
  const [answers, setAnswers] = useState<Record<number, { text: string; images: string[] }>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mapOpen, setMapOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  // Flatten all questions for navigation, keeping track of section
  const allQuestions = useMemo(() => {
    if (!test) return []
    const qs: Array<{ question: import("@/types/test").Question; sectionId: string; sectionName: string; sectionRequiredCount: number }> = []
    test.sections.forEach(section => {
      section.questions.forEach(q => {
        qs.push({ question: q, sectionId: section.id, sectionName: section.name, sectionRequiredCount: section.requiredCount })
      })
    })
    return qs
  }, [test])

  const totalSeconds = useMemo(
    () =>
      test && test.config.timerEnabled
        ? test.config.timerMinutes * 60
        : 0,
    [test],
  )

  const handleExpire = () => {
    toast.warning("Time's up!", {
      description: "Your test has been auto-submitted.",
    })
    if (test) void doSubmit(test)
  }

  const timer = useTimer(totalSeconds, handleExpire)

  // Start the timer once when the page mounts (if enabled).
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
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], text: value } }))
  }

  function addImageToAnswer(questionId: number, imageDataUrl: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], images: [...(prev[questionId]?.images || []), imageDataUrl] }
    }))
  }

  function removeImageFromAnswer(questionId: number, imageIndex: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        images: prev[questionId]?.images.filter((_, i) => i !== imageIndex) || []
      }
    }))
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function goNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function jumpTo(index: number) {
    setCurrentIndex(index)
    setMapOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function doSubmit(testToSubmit: GeneratedTest): TestResult {
    timer.pause()
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    const result = gradeTest(testToSubmit, answers, elapsed)
    saveResult(result)
    navigate(`/results/${testToSubmit.id}`)
    return result
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
            onAnswer={(value) => setAnswer(currentQuestion.id, value)}
            onPrev={currentIndex > 0 ? goPrev : undefined}
            onNext={currentIndex < total - 1 ? goNext : undefined}
            isLast={currentIndex === total - 1}
            onSubmit={() => setSubmitOpen(true)}
            onAddImage={(imageDataUrl) => currentQuestion && addImageToAnswer(currentQuestion.id, imageDataUrl)}
            onRemoveImage={(imageIndex) => currentQuestion && removeImageFromAnswer(currentQuestion.id, imageIndex)}
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
          if (test) doSubmit(test)
        }}
      />
    </PageTransition>
  )
}
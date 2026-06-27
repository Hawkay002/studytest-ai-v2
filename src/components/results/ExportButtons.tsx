import { forwardRef, useRef, useState } from "react"
import { FileDown, Plus, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { typeLabel, exportNodeToPdf } from "@/lib/pdf"
import type { GeneratedTest } from "@/types/test"

interface ExportButtonsProps {
  test: GeneratedTest
  onRetake: () => void
  onNewTest: () => void
}

function getAllQuestions(test: GeneratedTest) {
  return test.sections.flatMap(section => section.questions)
}

export function ExportButtons({
  test,
  onRetake,
  onNewTest,
}: ExportButtonsProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const keyRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<"sheet" | "key" | null>(null)

  const safeName = (test.topic || "test").replace(/[^\w-]+/g, "_").slice(0, 40)

  const exportPdf = async (which: "sheet" | "key") => {
    const node = which === "sheet" ? sheetRef.current : keyRef.current
    if (!node) return
    setBusy(which)
    try {
      await exportNodeToPdf(node, {
        filename:
          which === "sheet"
            ? `${safeName}_test_sheet.pdf`
            : `${safeName}_answer_key.pdf`,
      })
      toast.success("PDF downloaded")
    } catch {
      toast.error("Could not generate PDF", {
        description: "Try again in a moment.",
      })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div className="sticky bottom-4 z-30 grid grid-cols-2 gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur sm:grid-cols-4">
        <Button
          variant="outline"
          onClick={() => exportPdf("sheet")}
          disabled={busy !== null}
          className="gap-1.5"
        >
          <FileDown className="h-4 w-4" />
          {busy === "sheet" ? "Working..." : "Test Sheet"}
        </Button>
        <Button
          variant="outline"
          onClick={() => exportPdf("key")}
          disabled={busy !== null}
          className="gap-1.5"
        >
          <FileDown className="h-4 w-4" />
          {busy === "key" ? "Working..." : "Answer Key"}
        </Button>
        <Button variant="outline" onClick={onRetake} className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          Retake
        </Button>
        <Button onClick={onNewTest} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Test
        </Button>
      </div>

      {/* Hidden print targets (off-screen, white background). */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: 800,
          background: "#ffffff",
          color: "#111111",
        }}
      >
        <PrintableSheet ref={sheetRef} test={test} />
        <PrintableAnswerKey ref={keyRef} test={test} />
      </div>
    </>
  )
}

const PrintableSheet = forwardRef<HTMLDivElement, { test: GeneratedTest }>(
  function PrintableSheet({ test }, ref) {
    return (
      <PrintableBody ref={ref}>
        <PrintableHeader title={test.topic} subtitle="Practice test" />
        <ol>
          {getAllQuestions(test).map((q) => (
            <li key={q.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>{q.question}</div>
              {q.type === "mcq" && (
                <ul>
                  {q.options.map((o) => (
                    <li key={o} style={{ marginLeft: 16 }}>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
              {q.type === "true_false" && (
                <div style={{ marginLeft: 16, color: "#555" }}>True / False</div>
              )}
              <div style={{ marginLeft: 16, color: "#888", fontSize: 12 }}>
                ({typeLabel(q.type)})
              </div>
            </li>
          ))}
        </ol>
      </PrintableBody>
    )
  },
)

const PrintableAnswerKey = forwardRef<HTMLDivElement, { test: GeneratedTest }>(
  function PrintableAnswerKey({ test }, ref) {
    return (
      <PrintableBody ref={ref}>
        <PrintableHeader title={test.topic} subtitle="Answer key" />
        <ol>
          {getAllQuestions(test).map((q) => (
            <li key={q.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>{q.question}</div>
              <div style={{ marginLeft: 16 }}>
                <strong>Answer:</strong> {answerOf(q)}
              </div>
              {q.explanation && (
                <div style={{ marginLeft: 16, color: "#555" }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </li>
          ))}
        </ol>
      </PrintableBody>
    )
  },
)

function answerOf(q: ReturnType<typeof getAllQuestions>[number]): string {
  switch (q.type) {
    case "mcq": {
      const match = q.options.find((o) => o.startsWith(q.answer))
      return match ?? q.answer
    }
    default:
      return q.answer
  }
}

const PrintableBody = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function PrintableBody({ children }, ref) {
    return (
      <div
        ref={ref}
        style={{
          padding: 32,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    )
  },
)

function PrintableHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div style={{ marginBottom: 24, borderBottom: "2px solid #111", paddingBottom: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{title}</div>
      <div style={{ color: "#666" }}>StudyTest AI &middot; {subtitle}</div>
    </div>
  )
}
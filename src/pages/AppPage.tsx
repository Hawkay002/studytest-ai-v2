import { useEffect, useRef, useState } from "react"
import { useLocation } from "wouter"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { toast } from "sonner"

import { StepIndicator } from "@/components/common/StepIndicator"
import { LoadingOverlay } from "@/components/common/LoadingOverlay"
import { ContentInputTabs } from "@/components/input/ContentInputTabs"
import { TestConfigPanel } from "@/components/config/TestConfigPanel"
import { useApp } from "@/context/AppContext"
import { useApiKey } from "@/context/ApiKeyContext"
import { useApiKeyModal } from "@/components/common/ApiKeyModal"
import { useTestGenerator } from "@/hooks/useTestGenerator"
import { dataUrlToInlinePart } from "@/lib/imageUtils"
import { PageTransition } from "@/components/layout/PageTransition"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButtons } from "@/components/results/ExportButtons"
import type { GeneratedTest } from "@/types/test"

export function AppPage() {
  const { step, setStep, input, config, saveTest, setActiveTestId } = useApp()
  const { apiKey, isKeySet } = useApiKey()
  const { open: openApiKey } = useApiKeyModal()
  const { generate, isGenerating, error, cancelGeneration } =
    useTestGenerator()
  const [, navigate] = useLocation()
  const reduce = useReducedMotion()

  // State for generated test preview
  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null)

  // Auto-open the API key modal on /app if no key is set.
  const askedForOpen = useRef(false)
  useEffect(() => {
    if (!isKeySet && !askedForOpen.current) {
      askedForOpen.current = true
      openApiKey()
    }
  }, [isKeySet, openApiKey])

  const startGeneration = async () => {
    if (!isKeySet) {
      openApiKey()
      return
    }
    setStep("generating")
    const images =
      input.inputMode === "image"
        ? input.images.map(dataUrlToInlinePart)
        : undefined

    const test = await generate(apiKey, {
      topic: input.topic,
      context: input.context,
      inputType: input.inputMode,
      images,
      config,
    })

    if (!test) {
      setStep("config")
      if (error) {
        toast.error("Generation failed", {
          description: error,
          action: {
            label: "Retry",
            onClick: () => void startGeneration(),
          },
        })
      }
      return
    }

    setGeneratedTest(test)
    saveTest(test)
    setActiveTestId(test.id)
    setStep("done")
    toast.success("Test generated!", {
      description: `${test.sections.flatMap(s => s.questions).length} questions ready.`,
    })
  }

  return (
    <PageTransition>
      <div className="container max-w-3xl py-8 md:py-12">
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>

        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={reduce ? false : { opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -80 }}
              transition={{ duration: 0.25 }}
            >
              <ContentInputTabs onNext={() => setStep("config")} />
            </motion.div>
          )}

          {step === "config" && (
            <motion.div
              key="config"
              initial={reduce ? false : { opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -80 }}
              transition={{ duration: 0.25 }}
            >
              <TestConfigPanel
                onBack={() => setStep("input")}
                onGenerate={startGeneration}
              />
            </motion.div>
          )}

          {step === "done" && generatedTest && (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -80 }}
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{generatedTest.topic}</h1>
                    <p className="text-muted-foreground mt-1">
                      {generatedTest.sections.length} section(s),{" "}
                      {generatedTest.sections.flatMap(s => s.questions).length}{" "}
                      question(s), {Object.values(generatedTest.config.marksDistribution).reduce((a, b) => a + b, 0)} marks
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedTest.sections.map(section => (
                      <div key={section.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{section.name}</span>
                          <span className="text-sm text-muted-foreground">{section.description}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {section.questions.map(q => (
                            <div key={q.id} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">{q.type.replace('_', ' ')}</span>
                              <span className="flex-1 truncate">{q.question.substring(0, 80)}...</span>
                              <span className="text-primary font-semibold">{q.marks} marks</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <ExportButtons
                  test={generatedTest}
                  onRetake={() => navigate(`/test/${generatedTest.id}`)}
                  onNewTest={() => {
                    setStep("input")
                    setGeneratedTest(null)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isGenerating && <LoadingOverlay onCancel={cancelGeneration} />}
    </PageTransition>
  )
}
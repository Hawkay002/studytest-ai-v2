import { useLocation, useParams } from "wouter"
import {
  BarChart2,
  ChevronLeft,
  FileText,
  Plus,
  RotateCcw,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScoreCard } from "@/components/results/ScoreCard"
import { AnswerSheet } from "@/components/results/AnswerSheet"
import { ExportButtons } from "@/components/results/ExportButtons"
import { useApp } from "@/context/AppContext"
import { PageTransition } from "@/components/layout/PageTransition"

export function ResultsPage() {
  const params = useParams<{ id: string }>()
  const [, navigate] = useLocation()
  const { getTest, getResult } = useApp()

  const test = params.id ? getTest(params.id) : undefined
  const result = params.id ? getResult(params.id) : undefined

  if (!test || !result) {
    return (
      <PageTransition>
        <div className="container flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">No result found for this test.</p>
          <Button onClick={() => navigate("/history")}>
            View History
          </Button>
        </div>
      </PageTransition>
    )
  }

  const onRetake = () => {
    navigate(`/test/${test.id}`)
  }

  const onNewTest = () => {
    navigate("/app")
  }

  return (
    <PageTransition>
      <div className="container max-w-3xl py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/history")}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to History
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onRetake} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
            <Button onClick={onNewTest} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Test
            </Button>
          </div>
        </div>

        <Tabs defaultValue="score" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="score" className="gap-1.5">
              <BarChart2 className="h-4 w-4" />
              Score
            </TabsTrigger>
            <TabsTrigger value="answers" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Answers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="animate-in fade-in slide-in-from-bottom-2">
            <ScoreCard test={test} result={result} />
          </TabsContent>

          <TabsContent value="answers" className="animate-in fade-in slide-in-from-bottom-2">
            <AnswerSheet test={test} result={result} />
          </TabsContent>
        </Tabs>

        <ExportButtons
          test={test}
          onRetake={onRetake}
          onNewTest={onNewTest}
        />
      </div>
    </PageTransition>
  )
}
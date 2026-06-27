import { useState } from "react"
import { useLocation } from "wouter"
import {
  CalendarDays,
  ClipboardList,
  Eye,
  Trash2,
  Trophy,
  History,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/common/EmptyState"
import { useTestHistory } from "@/hooks/useTestHistory"
import { PageTransition } from "@/components/layout/PageTransition"
import { cn } from "@/lib/utils"
import { getAllQuestions } from "@/components/results/ScoreCard"

export function HistoryPage() {
  const [, navigate] = useLocation()
  const { history, removeEntry, clearAll } = useTestHistory()
  const [confirmClear, setConfirmClear] = useState(false)

  if (history.length === 0) {
    return (
      <PageTransition>
        <EmptyState
          icon={ClipboardList}
          title="No tests yet"
          description="Generate your first test to see it here."
          action={{
            label: "Start Studying",
            onClick: () => navigate("/app"),
          }}
        />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="container max-w-3xl py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <History className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold">Test History</h1>
          </div>

          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="space-y-3">
          {history.map(({ test, result }) => {
            const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0
            const questions = getAllQuestions(test)
            return (
              <Card key={test.id} className="overflow-hidden transition-colors hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold leading-none truncate">
                          {test.topic}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-2 font-medium",
                            pct >= 80 ? "bg-green-100 text-green-700 border-green-200" :
                            pct >= 60 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                            "bg-red-100 text-red-700 border-red-200"
                          )}
                        >
                          {pct}% &middot; {result.score}/{result.total}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {questions.length} questions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate(`/results/${test.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeEntry(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all your saved tests and results.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  clearAll()
                  setConfirmClear(false)
                }}
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  )
}
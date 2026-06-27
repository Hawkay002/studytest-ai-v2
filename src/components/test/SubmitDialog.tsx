import { AlertTriangle, CheckCircle2 } from "lucide-react"

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

interface SubmitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  unanswered: number[] // 1-based indices of unanswered questions
  onConfirm: () => void
}

export function SubmitDialog({
  open,
  onOpenChange,
  total,
  unanswered,
  onConfirm,
}: SubmitDialogProps) {
  const allAnswered = unanswered.length === 0
  const list = unanswered.slice(0, 8).join(", ")
  const extra = unanswered.length > 8 ? ` and ${unanswered.length - 8} more` : ""

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={
              allAnswered
                ? "flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-500"
                : "flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500"
            }
          >
            {allAnswered ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <AlertDialogTitle>
            {allAnswered
              ? "Ready to submit?"
              : `${unanswered.length} question${unanswered.length === 1 ? "" : "s"} unanswered`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {allAnswered
              ? `You've answered all ${total} questions.`
              : `Questions ${list}${extra} haven't been answered. Submit anyway?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {allAnswered ? "Review answers" : "Go back"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              allAnswered
                ? undefined
                : "bg-amber-600 text-white hover:bg-amber-600/90"
            }
          >
            {allAnswered ? "Submit test" : "Submit anyway"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

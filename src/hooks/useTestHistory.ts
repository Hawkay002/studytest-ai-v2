import { useCallback, useMemo } from "react"

import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { GeneratedTest, HistoryEntry, TestResult } from "@/types/test"
import { STORAGE_KEYS } from "@/lib/storage"

const MAX_ENTRIES = 20

export interface UseTestHistoryResult {
  history: HistoryEntry[]
  addEntry: (test: GeneratedTest, result: TestResult) => void
  removeEntry: (testId: string) => void
  clearAll: () => void
  getEntry: (testId: string) => HistoryEntry | undefined
}

/**
 * Stores the last MAX_ENTRIES completed tests in localStorage, pruning the
 * oldest entry on overflow. Newest first.
 */
export function useTestHistory(): UseTestHistoryResult {
  const [history, setHistory, clearAll] = useLocalStorage<HistoryEntry[]>(
    STORAGE_KEYS.history,
    [],
  )

  const addEntry = useCallback(
    (test: GeneratedTest, result: TestResult) => {
      setHistory((prev) => {
        const filtered = prev.filter((e) => e.test.id !== test.id)
        const next = [{ test, result }, ...filtered]
        return next.slice(0, MAX_ENTRIES)
      })
    },
    [setHistory],
  )

  const removeEntry = useCallback(
    (testId: string) => {
      setHistory((prev) => prev.filter((e) => e.test.id !== testId))
    },
    [setHistory],
  )

  const getEntry = useCallback(
    (testId: string) => history.find((e) => e.test.id === testId),
    [history],
  )

  return useMemo(
    () => ({ history, addEntry, removeEntry, clearAll, getEntry }),
    [history, addEntry, removeEntry, clearAll, getEntry],
  )
}

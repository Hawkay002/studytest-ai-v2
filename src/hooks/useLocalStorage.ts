import { useCallback, useEffect, useState } from "react"

import { readJSON, writeJSON } from "@/lib/storage"

/**
 * Generic localStorage-backed state. Reads synchronously on mount and writes
 * through on every change. Falls back gracefully when storage is unavailable.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => readJSON(key, defaultValue))

  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])

  const remove = useCallback(() => {
    setValue(defaultValue)
    writeJSON(key, defaultValue)
  }, [key, defaultValue])

  return [value, setValue, remove]
}

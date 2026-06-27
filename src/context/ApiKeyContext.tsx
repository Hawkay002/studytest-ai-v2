import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { validateApiKey } from "@/lib/gemini"
import { STORAGE_KEYS, readString, remove, writeString } from "@/lib/storage"

interface ApiKeyContextValue {
  apiKey: string
  isKeySet: boolean
  isValidating: boolean
  isValid: boolean | null // null = untested
  setApiKey: (key: string) => void
  clearApiKey: () => void
  validate: () => Promise<boolean>
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined)

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>(() =>
    readString(STORAGE_KEYS.apiKey, ""),
  )
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key)
    writeString(STORAGE_KEYS.apiKey, key)
    setIsValid(null)
  }, [])

  const clearApiKey = useCallback(() => {
    setApiKeyState("")
    remove(STORAGE_KEYS.apiKey)
    setIsValid(null)
  }, [])

  const validate = useCallback(async () => {
    if (!apiKey.trim()) return false
    setIsValidating(true)
    try {
      const ok = await validateApiKey(apiKey)
      setIsValid(ok)
      if (!ok) {
        toast.error("Invalid API key", {
          description: "Check your key at aistudio.google.com",
        })
      }
      return ok
    } finally {
      setIsValidating(false)
    }
  }, [apiKey])

  const value = useMemo<ApiKeyContextValue>(
    () => ({
      apiKey,
      isKeySet: apiKey.trim().length > 0,
      isValidating,
      isValid,
      setApiKey,
      clearApiKey,
      validate,
    }),
    [apiKey, isValidating, isValid, setApiKey, clearApiKey, validate],
  )

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error("useApiKey must be used within an ApiKeyProvider")
  return ctx
}

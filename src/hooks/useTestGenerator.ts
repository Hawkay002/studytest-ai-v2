import { useCallback, useRef, useState } from "react"

import { generateTest as generateTestApi } from "@/lib/gemini"
import type { InlineImagePart } from "@/lib/imageUtils"
import type { GeneratedTest, TestConfig } from "@/types/test"

export interface GenerateArgs {
  topic: string
  context: string
  inputType: "image" | "text"
  images?: InlineImagePart[]
  config: TestConfig
}

export interface UseTestGeneratorResult {
  generate: (apiKey: string, args: GenerateArgs) => Promise<GeneratedTest | null>
  isGenerating: boolean
  error: string | null
  cancelGeneration: () => void
  retryGeneration: (
    apiKey: string,
    args: GenerateArgs,
  ) => Promise<GeneratedTest | null>
  clearError: () => void
}

/**
 * Wraps generateTest with cancel + retry semantics and loading/error state.
 * Cancellation is cooperative: the in-flight promise still resolves but its
 * result is discarded if the caller already navigated away.
 */
export function useTestGenerator(): UseTestGeneratorResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelledRef = useRef(false)
  const lastArgsRef = useRef<{ apiKey: string; args: GenerateArgs } | null>(null)

  const run = useCallback(
    async (
      apiKey: string,
      args: GenerateArgs,
    ): Promise<GeneratedTest | null> => {
      setIsGenerating(true)
      setError(null)
      cancelledRef.current = false
      lastArgsRef.current = { apiKey, args }
      try {
        const test = await generateTestApi({ apiKey, ...args })
        if (cancelledRef.current) return null
        return test
      } catch (err) {
        if (cancelledRef.current) return null
        const msg =
          err instanceof Error ? err.message : "Generation failed."
        setError(msg)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    [],
  )

  const cancelGeneration = useCallback(() => {
    cancelledRef.current = true
    setIsGenerating(false)
  }, [])

  const retryGeneration = useCallback(
    (apiKey: string, args: GenerateArgs) => run(apiKey, args),
    [run],
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    generate: run,
    isGenerating,
    error,
    cancelGeneration,
    retryGeneration,
    clearError,
  }
}

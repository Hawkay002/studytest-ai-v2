import { useCallback, useEffect, useRef, useState } from "react"

const MINUTE = 60

export interface UseTimerResult {
  timeLeft: number
  formattedTime: string
  isRunning: boolean
  isExpired: boolean
  percentage: number
  start: () => void
  pause: () => void
  reset: (totalSeconds?: number) => void
}

function format(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / MINUTE)
  const r = s % MINUTE
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

/**
 * Countdown timer for the test page. Ticks every second using setInterval.
 * `onExpire` fires exactly once when the clock hits zero.
 */
export function useTimer(
  initialSeconds: number,
  onExpire?: () => void,
): UseTimerResult {
  const [total, setTotal] = useState(initialSeconds)
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const firedRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!isRunning) return
    if (timeLeft <= 0) {
      setIsRunning(false)
      if (!firedRef.current) {
        firedRef.current = true
        onExpireRef.current?.()
      }
      return
    }
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isRunning, timeLeft])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])

  const reset = useCallback((next?: number) => {
    setIsRunning(false)
    firedRef.current = false
    if (typeof next === "number") {
      setTotal(next)
      setTimeLeft(next)
    } else {
      setTimeLeft(total)
    }
  }, [total])

  return {
    timeLeft,
    formattedTime: format(timeLeft),
    isRunning,
    isExpired: timeLeft === 0 && total > 0,
    percentage: total > 0 ? (timeLeft / total) * 100 : 0,
    start,
    pause,
    reset,
  }
}

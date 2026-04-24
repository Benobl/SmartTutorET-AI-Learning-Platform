"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Session timeout hook — monitors user activity and redirects to login
 * after the specified timeout (default 15 minutes).
 * Shows a warning 1 minute before timeout.
 */
export function useSessionTimeout(timeoutMs = 15 * 60 * 1000) {
    const router = useRouter()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
    const [showWarning, setShowWarning] = useState(false)
    const [remainingSeconds, setRemainingSeconds] = useState(60)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)

    const clearAllTimers = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
        if (countdownRef.current) clearInterval(countdownRef.current)
    }, [])

    const handleTimeout = useCallback(() => {
        clearAllTimers()
        setShowWarning(false)
        // In production, clear session/token here
        router.push("/login?reason=timeout")
    }, [router, clearAllTimers])

    const resetTimer = useCallback(() => {
        clearAllTimers()
        setShowWarning(false)
        setRemainingSeconds(60)

        // Warning appears 1 minute before timeout
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true)
            setRemainingSeconds(60)
            // Start countdown
            countdownRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        handleTimeout()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }, timeoutMs - 60000)

        // Actual timeout
        timerRef.current = setTimeout(handleTimeout, timeoutMs)
    }, [timeoutMs, handleTimeout, clearAllTimers])

    const extendSession = useCallback(() => {
        resetTimer()
    }, [resetTimer])

    useEffect(() => {
        const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"]

        const handleActivity = () => {
            // Only reset if warning is NOT showing (to avoid resetting during countdown)
            if (!showWarning) {
                resetTimer()
            }
        }

        events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))
        resetTimer()

        return () => {
            clearAllTimers()
            events.forEach((event) => window.removeEventListener(event, handleActivity))
        }
    }, [resetTimer, clearAllTimers, showWarning])

    return { showWarning, remainingSeconds, extendSession }
}

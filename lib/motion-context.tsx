"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"

interface MotionContextType {
    motionEnabled: boolean
    setMotionEnabled: (enabled: boolean) => void
    toggleMotion: () => void
}

const MotionContext = createContext<MotionContextType | undefined>(undefined)

const STORAGE_KEY = "hov-motion-enabled"

export function MotionProvider({ children }: { children: ReactNode }) {
    const [motionEnabled, setMotionEnabledState] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved !== null) {
                setMotionEnabledState(saved === "true")
            }
        } catch (e) {
            // Silently fail if localStorage is not available
            console.warn("Failed to read motion preference from localStorage:", e)
        }
        setMounted(true)
    }, [])

    const setMotionEnabled = (enabled: boolean) => {
        setMotionEnabledState(enabled)
        try {
            localStorage.setItem(STORAGE_KEY, String(enabled))
        } catch (e) {
            // Silently fail if localStorage is not available (e.g., quota exceeded, private mode)
            console.warn("Failed to save motion preference to localStorage:", e)
        }
    }

    const toggleMotion = () => {
        setMotionEnabled(!motionEnabled)
    }

    // Initial render disables animations until preferences load to prevent hydration mismatch and flash
    if (!mounted) {
        return (
            <MotionContext.Provider
                value={{ motionEnabled: false, setMotionEnabled, toggleMotion }}
            >
                {children}
            </MotionContext.Provider>
        )
    }

    return (
        <MotionContext.Provider
            value={{ motionEnabled, setMotionEnabled, toggleMotion }}
        >
            {children}
        </MotionContext.Provider>
    )
}

export function useMotion() {
    const context = useContext(MotionContext)
    if (context === undefined) {
        throw new Error("useMotion must be used within a MotionProvider")
    }
    return context
}

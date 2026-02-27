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
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) {
            setMotionEnabledState(saved === "true")
        }
        setMounted(true)
    }, [])

    const setMotionEnabled = (enabled: boolean) => {
        setMotionEnabledState(enabled)
        localStorage.setItem(STORAGE_KEY, String(enabled))
    }

    const toggleMotion = () => {
        setMotionEnabled(!motionEnabled)
    }

    // Prevent hydration mismatch - render without animations initially
    if (!mounted) {
        return (
            <MotionContext.Provider
                value={{ motionEnabled: true, setMotionEnabled, toggleMotion }}
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

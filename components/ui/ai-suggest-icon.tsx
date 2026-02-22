"use client"

import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiSuggestIconProps {
  loading: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function AiSuggestIcon({ loading, size = "md", className }: AiSuggestIconProps) {
  const sizeClass = sizeClasses[size]
  return (
    <span
      role={loading ? "status" : undefined}
      aria-busy={loading}
      aria-label={loading ? "AI suggesting" : "AI suggest"}
      className={cn("inline-flex shrink-0", className)}
    >
      {loading ? (
        <Loader2 className={cn(sizeClass, "animate-spin")} />
      ) : (
        <Sparkles className={sizeClass} />
      )}
    </span>
  )
}

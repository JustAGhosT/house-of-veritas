"use client"

import { AlertTriangle, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorItem {
  message: string
  name?: string
  stack?: string
  digest?: string
  cause?: unknown
}

function toErrorItem(e: Error | { message?: string; name?: string; stack?: string; cause?: unknown }): ErrorItem {
  return {
    message: e?.message || "Unknown error",
    name: "name" in e ? e.name : undefined,
    stack: "stack" in e ? e.stack : undefined,
    cause: "cause" in e ? e.cause : undefined,
  }
}

export function flattenErrors(error: Error & { digest?: string; errors?: unknown[] }): ErrorItem[] {
  const main = toErrorItem(error)
  if (error?.digest) main.digest = error.digest
  const items: ErrorItem[] = [main]
  const nested = error?.errors
  if (Array.isArray(nested)) {
    for (const e of nested) {
      if (e instanceof Error) {
        items.push(toErrorItem(e))
      } else if (e && typeof e === "object" && "message" in e) {
        items.push({ message: String((e as { message?: unknown }).message) })
      }
    }
  }
  return items
}

function getHelpfulTips(error: ErrorItem): string[] {
  const tips: string[] = []
  const msg = (error.message || "").toLowerCase()
  const name = (error.name || "").toLowerCase()

  if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch")) {
    tips.push("Check your internet connection and try again.")
    tips.push("The server may be temporarily unavailable.")
  }
  if (msg.includes("401") || msg.includes("unauthorized")) {
    tips.push("Your session may have expired. Try logging in again.")
  }
  if (msg.includes("403") || msg.includes("forbidden")) {
    tips.push("You may not have permission to access this resource.")
  }
  if (msg.includes("404") || msg.includes("not found")) {
    tips.push("The requested resource may have been moved or deleted.")
  }
  if (msg.includes("500") || msg.includes("internal server")) {
    tips.push("The server encountered an error. Please try again later.")
  }
  if (name.includes("chunk") || msg.includes("chunk") || msg.includes("loading")) {
    tips.push("A new version may have been deployed. Refresh the page.")
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    tips.push("The request took too long. Try again when the server is less busy.")
  }

  if (tips.length === 0) {
    tips.push("Try refreshing the page.")
    tips.push("If the problem persists, contact support with the error details below.")
  }

  return tips
}

interface ErrorDisplayProps {
  errors: ErrorItem[]
  onRetry?: () => void
  variant?: "page" | "inline"
  className?: string
}

export function ErrorDisplay({
  errors,
  onRetry,
  variant = "page",
  className,
}: ErrorDisplayProps) {
  const isPage = variant === "page"

  return (
    <div
      className={cn(
        "flex flex-col",
        isPage
          ? "min-h-screen bg-[#0a0a0f] items-center justify-center p-6"
          : "min-h-[200px] p-6 rounded-lg border border-red-500/20 bg-red-500/5",
        className
      )}
    >
      <div className={cn("text-center", isPage ? "max-w-2xl w-full" : "w-full")}>
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30 mb-6",
            isPage ? "w-16 h-16" : "w-12 h-12 mb-4"
          )}
        >
          <AlertTriangle className={cn("text-red-400", isPage ? "w-8 h-8" : "w-6 h-6")} />
        </div>
        <h1
          className={cn(
            "font-semibold text-white mb-2",
            isPage ? "text-2xl" : "text-lg"
          )}
        >
          Something went wrong
        </h1>
        <p className="text-white/60 mb-4">
          {errors.length === 1
            ? errors[0]?.message || "An unexpected error occurred."
            : `${errors.length} errors occurred.`}
        </p>

        {errors.length > 1 && (
          <div className="mb-4 text-left">
            <p className="text-sm font-medium text-white/80 mb-2">Errors:</p>
            <ul className="space-y-1 text-sm text-white/60 list-disc list-inside">
              {errors.map((e, i) => (
                <li key={i}>{e.message || "Unknown error"}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-left space-y-4 mb-6">
          {errors.map((error, idx) => (
            <ErrorDetails key={idx} error={error} index={idx} total={errors.length} />
          ))}
        </div>

        {errors.length > 0 && (
          <div className="text-left mb-6">
            <p className="text-sm font-medium text-white/80 mb-2">Suggestions:</p>
            <ul className="space-y-1 text-sm text-white/60 list-disc list-inside">
              {getHelpfulTips(errors[0]).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {onRetry && (
          <Button onClick={onRetry} className="inline-flex gap-2" size={isPage ? "default" : "sm"}>
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}

function ErrorDetails({
  error,
  index,
  total,
}: {
  error: ErrorItem
  index: number
  total: number
}) {
  const hasDetails =
    error.stack || error.name || error.digest || (error.cause && String(error.cause))

  if (!hasDetails) return null

  return (
    <details className="group rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm text-white/80 hover:bg-white/5 list-none">
        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
        <span>
          {total > 1 ? `Error ${index + 1}: ` : ""}
          {error.name || "Error"} — {error.message?.slice(0, 60)}
          {error.message && error.message.length > 60 ? "…" : ""}
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-3 text-sm">
        {error.name && (
          <div>
            <span className="text-white/50">Type: </span>
            <code className="text-red-300">{error.name}</code>
          </div>
        )}
        {error.digest && (
          <div>
            <span className="text-white/50">Digest: </span>
            <code className="text-white/70 font-mono text-xs">{error.digest}</code>
          </div>
        )}
        {error.cause != null && (
          <div>
            <span className="text-white/50">Cause: </span>
            <pre className="mt-1 p-2 rounded bg-black/30 text-white/70 overflow-x-auto text-xs">
              {String(error.cause)}
            </pre>
          </div>
        )}
        {error.stack && (
          <div>
            <span className="text-white/50">Stack trace:</span>
            <pre className="mt-1 p-3 rounded bg-black/30 text-white/60 overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </details>
  )
}

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

function toErrorItem(
  e: Error | { message?: string; name?: string; stack?: string; cause?: unknown }
): ErrorItem {
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

export function ErrorDisplay({ errors, onRetry, variant = "page", className }: ErrorDisplayProps) {
  const isPage = variant === "page"

  return (
    <div
      className={cn(
        "flex flex-col",
        isPage
          ? "min-h-screen items-center justify-center bg-[#0a0a0f] p-6"
          : "min-h-[200px] rounded-lg border border-red-500/20 bg-red-500/5 p-6",
        className
      )}
    >
      <div className={cn("text-center", isPage ? "w-full max-w-2xl" : "w-full")}>
        <div
          className={cn(
            "mb-6 inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/20",
            isPage ? "h-16 w-16" : "mb-4 h-12 w-12"
          )}
        >
          <AlertTriangle className={cn("text-red-400", isPage ? "h-8 w-8" : "h-6 w-6")} />
        </div>
        <h1 className={cn("mb-2 font-semibold text-white", isPage ? "text-2xl" : "text-lg")}>
          Something went wrong
        </h1>
        <p className="mb-4 text-white/60">
          {errors.length === 1
            ? errors[0]?.message || "An unexpected error occurred."
            : `${errors.length} errors occurred.`}
        </p>

        {errors.length > 1 && (
          <div className="mb-4 text-left">
            <p className="mb-2 text-sm font-medium text-white/80">Errors:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-white/60">
              {errors.map((e, i) => (
                <li key={i}>{e.message || "Unknown error"}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6 space-y-4 text-left">
          {errors.map((error, idx) => (
            <ErrorDetails key={idx} error={error} index={idx} total={errors.length} />
          ))}
        </div>

        {errors.length > 0 && (
          <div className="mb-6 text-left">
            <p className="mb-2 text-sm font-medium text-white/80">Suggestions:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-white/60">
              {getHelpfulTips(errors[0]).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {onRetry && (
          <Button onClick={onRetry} className="inline-flex gap-2" size={isPage ? "default" : "sm"}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}

function ErrorDetails({ error, index, total }: { error: ErrorItem; index: number; total: number }) {
  const hasDetails =
    error.stack || error.name || error.digest || (error.cause && String(error.cause))

  if (!hasDetails) return null

  return (
    <details className="group overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/5">
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        <span>
          {total > 1 ? `Error ${index + 1}: ` : ""}
          {error.name || "Error"} — {error.message?.slice(0, 60)}
          {error.message && error.message.length > 60 ? "…" : ""}
        </span>
      </summary>
      <div className="space-y-3 px-4 pt-1 pb-4 text-sm">
        {error.name && (
          <div>
            <span className="text-white/50">Type: </span>
            <code className="text-red-300">{error.name}</code>
          </div>
        )}
        {error.digest && (
          <div>
            <span className="text-white/50">Digest: </span>
            <code className="font-mono text-xs text-white/70">{error.digest}</code>
          </div>
        )}
        {error.cause != null && (
          <div>
            <span className="text-white/50">Cause: </span>
            <pre className="mt-1 overflow-x-auto rounded bg-black/30 p-2 text-xs text-white/70">
              {String(error.cause)}
            </pre>
          </div>
        )}
        {error.stack && (
          <div>
            <span className="text-white/50">Stack trace:</span>
            <pre className="mt-1 max-h-48 overflow-x-auto overflow-y-auto rounded bg-black/30 p-3 font-mono text-xs break-words whitespace-pre-wrap text-white/60">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </details>
  )
}

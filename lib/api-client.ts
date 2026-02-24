import { logger } from "@/lib/logger"

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Label for log messages (e.g. "Stats", "Tasks") */
  label?: string
  /** Request body (object will be JSON.stringify'd) */
  body?: unknown
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public body?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Fetch API with consistent error handling and logging.
 * - Logs warn on 4xx/5xx, error on network/parse failures
 * - Throws ApiError on non-ok response, rethrows on network error
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { label = "API", body, ...init } = options
  const fetchOpts: RequestInit = { ...init }
  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchOpts.body = body
      fetchOpts.headers = init.headers
    } else {
      fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body)
      fetchOpts.headers = { "Content-Type": "application/json", ...init.headers }
    }
  } else {
    fetchOpts.headers = init.headers
  }

  let res: Response
  try {
    res = await fetch(url, fetchOpts)
  } catch (err) {
    logger.error(`${label} fetch failed`, {
      url,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }

  if (!res.ok) {
    logger.warn(`${label} API error`, {
      url,
      status: res.status,
      statusText: res.statusText,
    })
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
    throw new ApiError(
      `API error: ${res.status} ${res.statusText}`,
      res.status,
      res.statusText,
      body
    )
  }

  const text = await res.text()
  if (!text.trim()) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    logger.warn(`${label} invalid JSON`, { url, status: res.status })
    throw new ApiError("Invalid JSON response", res.status, res.statusText)
  }
}

/**
 * Safe fetch that returns fallback on any error instead of throwing.
 * Use for components that should show empty/placeholder state on failure.
 *
 * @example
 * // In useEffect for public/optional data:
 * apiFetchSafe<Stats>("/api/stats", null, { label: "Stats" }).then(setStats)
 *
 * // Migrate existing fetch: replace fetch(url).then(r=>r.json()).catch(...)
 * // with apiFetchSafe(url, fallback, { label: "MyApi" })
 */
export async function apiFetchSafe<T>(
  url: string,
  fallback: T,
  options: ApiFetchOptions = {}
): Promise<T> {
  try {
    return await apiFetch<T>(url, options)
  } catch {
    return fallback
  }
}

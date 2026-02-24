import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { apiFetch, apiFetchSafe, ApiError } from "@/lib/api-client"

function mockResponse(body: string, status: number, headers?: Record<string, string>): Response {
  return new Response(body, {
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers,
  })
}

describe("apiFetch", () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns parsed JSON on 200", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"ok":true}', 200))
    const result = await apiFetch("/api/test")
    expect(result).toEqual({ ok: true })
  })

  it("returns undefined for empty body on 200", async () => {
    fetchMock.mockResolvedValue(mockResponse("", 200))
    const result = await apiFetch("/api/test")
    expect(result).toBeUndefined()
  })

  it("returns undefined for whitespace-only body on 200", async () => {
    fetchMock.mockResolvedValue(mockResponse("   \n  ", 200))
    const result = await apiFetch("/api/test")
    expect(result).toBeUndefined()
  })

  it("throws ApiError with JSON body on non-ok response", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"message":"not found"}', 404))
    const err = (await apiFetch("/api/test").catch((e) => e)) as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(404)
    expect(err.body).toEqual({ message: "not found" })
  })

  it("throws ApiError with text body when non-ok response has invalid JSON", async () => {
    fetchMock.mockResolvedValue(mockResponse("plain error text", 500))
    const err = (await apiFetch("/api/test").catch((e) => e)) as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(500)
    expect(err.body).toBe("plain error text")
  })

  it("throws ApiError with empty body when non-ok response has no body", async () => {
    fetchMock.mockResolvedValue(mockResponse("", 401))
    const err = (await apiFetch("/api/test").catch((e) => e)) as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(401)
    expect(err.body).toBe("")
  })

  it("throws ApiError on invalid JSON in ok response", async () => {
    fetchMock.mockResolvedValue(mockResponse("not json", 200))
    const err = (await apiFetch("/api/test").catch((e) => e)) as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe("Invalid JSON response")
  })

  it("rethrows network error", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))
    const err = (await apiFetch("/api/test").catch((e) => e)) as TypeError
    expect(err).toBeInstanceOf(TypeError)
    expect(err.message).toBe("Failed to fetch")
  })

  it("sets Content-Type: application/json for object body", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"ok":true}', 200))
    await apiFetch("/api/test", { method: "POST", body: { foo: "bar" } })
    const [, opts] = fetchMock.mock.calls[0]
    const headers = new Headers(opts?.headers as HeadersInit)
    expect(headers.get("Content-Type")).toBe("application/json")
    expect(opts?.body).toBe('{"foo":"bar"}')
  })

  it("preserves caller headers when setting Content-Type", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"ok":true}', 200))
    await apiFetch("/api/test", {
      method: "POST",
      body: { x: 1 },
      headers: { Authorization: "Bearer token" },
    })
    const [, opts] = fetchMock.mock.calls[0]
    const headers = new Headers(opts?.headers as HeadersInit)
    expect(headers.get("Content-Type")).toBe("application/json")
    expect(headers.get("Authorization")).toBe("Bearer token")
  })

  it("does not set Content-Type for FormData body", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"ok":true}', 200))
    const fd = new FormData()
    fd.append("file", new Blob(["data"]), "test.txt")
    await apiFetch("/api/upload", { method: "POST", body: fd })
    const [, opts] = fetchMock.mock.calls[0]
    const headers = new Headers(opts?.headers as HeadersInit)
    expect(headers.get("Content-Type")).toBeNull()
    expect(opts?.body).toBe(fd)
  })

  it("accepts Headers instance as caller headers", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"ok":true}', 200))
    const callerHeaders = new Headers({ Authorization: "Bearer abc" })
    await apiFetch("/api/test", {
      method: "POST",
      body: { x: 1 },
      headers: callerHeaders,
    })
    const [, opts] = fetchMock.mock.calls[0]
    const headers = new Headers(opts?.headers as HeadersInit)
    expect(headers.get("Content-Type")).toBe("application/json")
    expect(headers.get("Authorization")).toBe("Bearer abc")
  })

  it("accepts [string, string][] as caller headers", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"ok":true}', 200))
    await apiFetch("/api/test", {
      method: "POST",
      body: { x: 1 },
      headers: [["X-Custom", "value"]],
    })
    const [, opts] = fetchMock.mock.calls[0]
    const headers = new Headers(opts?.headers as HeadersInit)
    expect(headers.get("Content-Type")).toBe("application/json")
    expect(headers.get("X-Custom")).toBe("value")
  })
})

describe("apiFetchSafe", () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns data on success", async () => {
    fetchMock.mockResolvedValue(mockResponse('{"value":42}', 200))
    const result = await apiFetchSafe("/api/test", null)
    expect(result).toEqual({ value: 42 })
  })

  it("returns fallback on non-ok response", async () => {
    fetchMock.mockResolvedValue(mockResponse("error", 500))
    const result = await apiFetchSafe("/api/test", { fallback: true })
    expect(result).toEqual({ fallback: true })
  })

  it("returns fallback on network error", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))
    const result = await apiFetchSafe("/api/test", [])
    expect(result).toEqual([])
  })
})

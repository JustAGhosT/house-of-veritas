import { describe, it, expect, vi } from "vitest"
import { withErrorHandling } from "@/lib/api/error-handler"

describe("error-handler", () => {
  it("returns handler result on success", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"))
    const wrapped = withErrorHandling(handler, { operation: "test" })
    const req = new Request("http://localhost/test")
    const res = await wrapped(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("ok")
  })

  it("returns 500 and fallback message on error", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("boom"))
    const wrapped = withErrorHandling(handler, {
      operation: "test",
      fallbackMessage: "Something went wrong",
    })
    const req = new Request("http://localhost/test")
    const res = await wrapped(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Something went wrong")
  })

  it("uses custom status when provided", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("not found"))
    const wrapped = withErrorHandling(handler, {
      operation: "test",
      status: 404,
    })
    const req = new Request("http://localhost/test")
    const res = await wrapped(req)
    expect(res.status).toBe(404)
  })

  it("handles non-Error throws", async () => {
    const handler = vi.fn().mockRejectedValue("string error")
    const wrapped = withErrorHandling(handler, { operation: "test" })
    const req = new Request("http://localhost/test")
    const res = await wrapped(req)
    expect(res.status).toBe(500)
  })
})

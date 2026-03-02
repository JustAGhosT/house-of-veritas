import { describe, it, expect, vi } from "vitest"
import { createSuggestionHandler } from "@/lib/api/ai-suggestion-handler"

describe("ai-suggestion-handler", () => {
  it("returns 400 for invalid JSON body", async () => {
    const handler = createSuggestionHandler({
      validate: (body) => ({ input: body }),
      suggest: vi.fn().mockResolvedValue("suggested"),
      options: ["a", "b"],
    })
    const req = new Request("http://localhost", {
      method: "POST",
      body: "not json",
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Invalid JSON")
  })

  it("returns validation error when validate returns error", async () => {
    const { NextResponse } = await import("next/server")
    const handler = createSuggestionHandler({
      validate: () => ({
        error: NextResponse.json({ error: "Bad" }, { status: 400 }),
      }),
      suggest: vi.fn(),
      options: ["a", "b"],
    })
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Bad")
  })

  it("returns 400 when input is null", async () => {
    const handler = createSuggestionHandler({
      validate: () => ({}),
      suggest: vi.fn(),
      options: ["a", "b"],
    })
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Validation failed")
  })

  it("returns suggested value when suggest returns", async () => {
    const suggest = vi.fn().mockResolvedValue("ai-suggested")
    const handler = createSuggestionHandler({
      validate: (body) => ({ input: body }),
      suggest,
      options: ["a", "b", "c"],
    })
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ category: "x" }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.suggested).toBe("ai-suggested")
    expect(json.aiPowered).toBe(true)
    expect(json.options).toEqual(["a", "b", "c"])
  })

  it("returns fallback when suggest returns null", async () => {
    const handler = createSuggestionHandler({
      validate: (body) => ({ input: body }),
      suggest: vi.fn().mockResolvedValue(null),
      options: ["a", "b"],
      defaultOption: "default",
    })
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.suggested).toBe("default")
    expect(json.aiPowered).toBe(false)
  })

  it("uses first option as fallback when no defaultOption", async () => {
    const handler = createSuggestionHandler({
      validate: (body) => ({ input: body }),
      suggest: vi.fn().mockResolvedValue(null),
      options: ["first", "second"],
    })
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    const json = await res.json()
    expect(json.suggested).toBe("first")
  })
})

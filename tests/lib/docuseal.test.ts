import { describe, it, expect, beforeEach } from "vitest"
import {
  isDocuSealConfigured,
  getTemplates,
  createSubmission,
  getSubmissionStatus,
} from "@/lib/services/docuseal"

describe("docuseal service", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  describe("isDocuSealConfigured", () => {
    it("returns false when DOCUSEAL_API_KEY is unset", () => {
      delete process.env.DOCUSEAL_API_KEY
      expect(isDocuSealConfigured()).toBe(false)
    })

    it("returns true when DOCUSEAL_API_KEY is set", () => {
      process.env.DOCUSEAL_API_KEY = "test-key"
      expect(isDocuSealConfigured()).toBe(true)
    })
  })

  describe("getTemplates (mock fallback)", () => {
    it("returns mock templates when not configured", async () => {
      delete process.env.DOCUSEAL_API_KEY
      const templates = await getTemplates()
      expect(Array.isArray(templates)).toBe(true)
      expect(templates.length).toBeGreaterThan(0)
      expect(templates[0]).toHaveProperty("id")
      expect(templates[0]).toHaveProperty("name")
      expect(templates[0]).toHaveProperty("fields")
    })
  })

  describe("createSubmission (mock fallback)", () => {
    it("returns mock submission when not configured", async () => {
      delete process.env.DOCUSEAL_API_KEY
      const submission = await createSubmission({
        templateId: "tpl_1",
        recipients: [{ email: "test@example.com", name: "Test", role: "signer" }],
      })
      expect(submission).not.toBeNull()
      expect(submission).toHaveProperty("id")
      expect(submission).toHaveProperty("templateId")
      expect(submission).toHaveProperty("status")
      expect(submission!.recipients).toHaveLength(1)
    })
  })

  describe("getSubmissionStatus (mock fallback)", () => {
    it("returns mock submission when not configured", async () => {
      delete process.env.DOCUSEAL_API_KEY
      const status = await getSubmissionStatus("sub_123")
      expect(status).not.toBeNull()
      expect(status!.id).toBe("sub_123")
      expect(status!.templateId).toBeDefined()
      expect(status!.status).toMatch(/pending|completed/)
    })
  })
})

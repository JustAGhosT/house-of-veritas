import { expect, test } from "@playwright/test"

const hansHeaders = {
  "x-user-id": "hans",
  "x-user-role": "admin",
  "x-user-email": "hans@houseofv.com",
}

async function postKioskRequest(request: import("@playwright/test").APIRequestContext) {
  const payload = {
    type: "stock_order",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: { itemName: "E2E test item", quantity: 1 },
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await request.post("/api/kiosk/requests", {
        headers: hansHeaders,
        data: payload,
      })
      if (response.ok()) {
        return response
      }
      if (attempt === 2) return response
    } catch (error) {
      if (attempt === 2) throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error("Failed to create kiosk request")
}

test.describe("Kiosk approval flow", () => {
  test("Hans can view approvals page", async ({ page }) => {
    await page.goto("/login")
    await page.getByTestId("email-input").fill("hans@houseofv.com")
    await page.getByTestId("password-input").fill("hans123")
    await page.getByTestId("login-submit").click()
    
    // Increased timeout and wait for load state to be more resilient
    await page.waitForURL("**/dashboard/hans**", { timeout: 30000, waitUntil: 'load' })

    // Use a direct page object check if navigation is slow
    await page.goto("/dashboard/hans/approvals", { timeout: 30000 })
    await expect(page.getByRole("heading", { name: /Approval Center|Approvals|Pending/i })).toBeVisible({
      timeout: 20000,
    })
  })

  test("POST kiosk request creates request when authenticated", async ({ request }) => {
    test.setTimeout(60000) // Double the timeout for this test
    const req = await postKioskRequest(request)
    expect(req.ok()).toBeTruthy()
    const body = await req.json()
    expect(body.success).toBe(true)
    expect(body.request).toBeDefined()
    expect(body.request.status).toBe("pending")
  })
})

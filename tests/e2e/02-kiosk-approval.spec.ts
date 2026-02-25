import { test, expect } from "@playwright/test"

async function loginAsHans(request: import("@playwright/test").APIRequestContext) {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: "hans@houseofv.com", password: "hans123" },
  })
  expect(loginRes.ok()).toBeTruthy()
  return loginRes
}

test.describe("Kiosk approval flow", () => {
  test("Hans can view approvals page", async ({ page }) => {
    await page.goto("/login")
    await page.getByTestId("email-input").fill("hans@houseofv.com")
    await page.getByTestId("password-input").fill("hans123")
    await page.getByTestId("login-submit").click()
    await page.waitForURL("**/dashboard/hans**", { timeout: 10000 })

    await page.goto("/dashboard/hans/approvals")
    await expect(page.getByRole("heading", { name: /Approvals|Pending/i })).toBeVisible({
      timeout: 10000,
    })
  })

  test("POST kiosk request creates request when authenticated", async ({ request }) => {
    await loginAsHans(request)
    const req = await request.post("/api/kiosk/requests", {
      data: {
        type: "stock_order",
        employeeId: "lucky",
        employeeName: "Lucky",
        data: { itemName: "E2E test item", quantity: 1 },
      },
    })
    expect(req.ok()).toBeTruthy()
    const body = await req.json()
    expect(body.success).toBe(true)
    expect(body.request).toBeDefined()
    expect(body.request.status).toBe("pending")
  })
})

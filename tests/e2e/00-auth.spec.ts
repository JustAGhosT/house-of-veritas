import { test, expect } from "@playwright/test"
import type { Page } from "@playwright/test"

const LOGIN_FORM_TIMEOUT = 15000

async function waitForLoginForm(page: Page) {
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible({ timeout: LOGIN_FORM_TIMEOUT })
}

async function fillLoginAndSubmit(page: Page, email: string, password: string) {
  await page.getByTestId("email-input").fill(email)
  await page.getByTestId("password-input").fill(password)
  await page.getByTestId("login-submit").click()
}

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await expect(page.getByRole("heading", { name: "House of Veritas" })).toBeVisible()
  })

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await fillLoginAndSubmit(page, "hans@houseofv.com", "wrongpassword")
    await expect(page.getByTestId("login-error")).toContainText(
      /Invalid credentials|Login failed|Connection error|Too many login attempts/,
      { timeout: 5000 }
    )
  })

  test("should login as Hans and see admin dashboard", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await fillLoginAndSubmit(page, "hans@houseofv.com", "hans123")
    await page.waitForURL("**/dashboard/hans**", { timeout: 10000 })
    await expect(page.locator("text=Welcome back")).toBeVisible()
  })

  test("should logout successfully", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await fillLoginAndSubmit(page, "hans@houseofv.com", "hans123")
    await page.waitForURL("**/dashboard/hans**", { timeout: 10000 })

    await page.getByTestId("user-profile-trigger").first().click()
    await page.getByTestId("header-logout").click()
    await page.waitForURL("**/login**", { timeout: 10000 })
  })

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard/hans")
    await page.waitForURL("**/login**", { timeout: 10000 })
  })

  test("should login as each user and see correct dashboard", async ({ page }) => {
    const users = [
      { email: "charl@houseofv.com", password: "charl123", id: "charl" },
      { email: "lucky@houseofv.com", password: "lucky123", id: "lucky" },
      { email: "irma@houseofv.com", password: "irma123", id: "irma" },
    ]

    for (const u of users) {
      await page.goto("/login")
      await waitForLoginForm(page)
      await fillLoginAndSubmit(page, u.email, u.password)
      await page.waitForURL(
        (url) => url.pathname === `/dashboard/${u.id}` || url.pathname === "/onboarding",
        { timeout: 10000 }
      )

      // Use API logout here for faster, deterministic cleanup between users.
      const logoutResponse = await page.request.post("/api/auth/logout")
      expect(logoutResponse.ok(), `Logout failed with status ${logoutResponse.status()}`).toBeTruthy()
      await page.goto("/login")
    }
  })
})

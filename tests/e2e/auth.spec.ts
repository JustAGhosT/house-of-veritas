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
    await expect(page.locator("text=House of Veritas")).toBeVisible()
  })

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await fillLoginAndSubmit(page, "hans@houseofv.com", "wrongpassword")
    await expect(page.locator("text=Invalid credentials").or(page.locator("text=Login failed"))).toBeVisible({ timeout: 5000 })
  })

  test("should login as Hans and see admin dashboard", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await fillLoginAndSubmit(page, "hans@houseofv.com", "hans123")
    await page.waitForURL("**/dashboard/hans**", { timeout: 10000 })
    await expect(page.locator("text=Welcome back")).toBeVisible()
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
      await page.waitForURL(`**/dashboard/${u.id}**`, { timeout: 10000 })

      await page.goto("/login")
    }
  })

  test("should logout successfully", async ({ page }) => {
    await page.goto("/login")
    await waitForLoginForm(page)
    await fillLoginAndSubmit(page, "hans@houseofv.com", "hans123")
    await page.waitForURL("**/dashboard/hans**", { timeout: 10000 })

    const logoutBtn = page.locator('[data-testid="header-logout"], [data-testid="logout-button"]').first()
    await logoutBtn.click()
    await page.waitForURL("**/login**", { timeout: 10000 })
  })
})

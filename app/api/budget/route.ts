import { NextResponse } from "next/server"
import {
  getBudgets,
  createBudget,
  updateBudget,
} from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"

export const GET = withRole("admin", "operator")(async (request) => {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period")
  const status = searchParams.get("status")

  try {
    const budgets = await getBudgets({
      period: period || undefined,
      status: status || undefined,
    })
    return withDataSource({ budgets })
  } catch (error) {
    logger.error("Error fetching budgets", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
})

export const POST = withRole("admin")(async (request) => {
  try {
    const body = await request.json()
    const { category, amount, period, notes } = body

    if (!category || amount == null) {
      return NextResponse.json(
        { error: "Category and amount are required" },
        { status: 400 }
      )
    }

    const year = new Date().getFullYear()
    const budget = await createBudget({
      category,
      amount,
      period: period || String(year),
      version: 1,
      status: "Draft",
      notes,
    })

    if (!budget) {
      return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
    }

    return withDataSource({ budget })
  } catch (error) {
    logger.error("Error creating budget", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
})

export const PATCH = withRole("admin")(async (request) => {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Budget ID is required" }, { status: 400 })
    }

    const budget = await updateBudget(id, updates)

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return withDataSource({ budget })
  } catch (error) {
    logger.error("Error updating budget", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
})

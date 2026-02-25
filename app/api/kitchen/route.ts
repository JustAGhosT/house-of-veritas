import { NextResponse } from "next/server"
import { createTask } from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { toISODateString } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"

export const POST = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request) => {
  try {
    const body = await request.json()
    const { type, description, location } = body

    if (!type || !description) {
      return NextResponse.json(
        { error: "Type and description are required" },
        { status: 400 }
      )
    }

    if (type === "cross_contamination") {
      const task = await createTask({
        title: `Cross-Contamination Report: ${location || "Kitchen"}`,
        description,
        priority: "High",
        status: "Not Started",
        dueDate: toISODateString(),
        project: "Kitchen",
      })

      if (task) {
        await routeToInngest({
          name: "house-of-veritas/kitchen.cross.contamination",
          data: {
            taskId: task.id,
            description,
            location: location || "Kitchen",
          },
        })
      }

      return withDataSource({ task, type: "cross_contamination" })
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 })
  } catch (error) {
    logger.error("Error creating kitchen report", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: "Failed to create kitchen report" },
      { status: 500 }
    )
  }
})

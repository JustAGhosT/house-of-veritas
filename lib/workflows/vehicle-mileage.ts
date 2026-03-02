import { inngest } from "@/lib/inngest/client"
import { getVehicleLogs, getTasks, createTask } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { toISODateString } from "@/lib/utils"
import { BASEROW_ID_TO_APP_ID } from "./constants"

const MILEAGE_THRESHOLD_KM = 100_000

export const vehicleMileageCheck = inngest.createFunction(
  { id: "vehicle-mileage-check", retries: 2 },
  { cron: "0 9 * * *" },
  async ({ step }) => {
    const logs = await getVehicleLogs()
    const vehicleMaxMileage = new Map<number, { name: string; mileage: number }>()

    for (const log of logs) {
      const mileage = log.odometerEnd ?? log.odometerStart
      const existing = vehicleMaxMileage.get(log.vehicle)
      if (!existing || mileage > existing.mileage) {
        vehicleMaxMileage.set(log.vehicle, {
          name: log.vehicleName ?? `Vehicle ${log.vehicle}`,
          mileage,
        })
      }
    }

    const overThreshold: { vehicleId: number; name: string; mileage: number }[] = []
    for (const [vehicleId, { name, mileage }] of vehicleMaxMileage) {
      if (mileage >= MILEAGE_THRESHOLD_KM) {
        overThreshold.push({ vehicleId, name, mileage })
      }
    }

    if (overThreshold.length === 0) return { checked: true, tasksCreated: 0 }

    const tasks = await getTasks()
    const openTasks = tasks.filter((t) => t.status !== "Completed")
    const hasExisting100kTask = (vehicleName: string) =>
      openTasks.some(
        (t) =>
          t.title.toLowerCase().includes("100k") &&
          t.title.toLowerCase().includes(vehicleName.toLowerCase().slice(0, 10))
      )

    const created: { id: number; title: string }[] = []
    for (const { vehicleId, name, mileage } of overThreshold) {
      if (hasExisting100kTask(name)) continue

      const task = await createTask({
        title: `Vehicle maintenance (100k+) - ${name} (${mileage.toLocaleString()} km)`,
        description: `Scheduled maintenance recommended: vehicle has exceeded ${MILEAGE_THRESHOLD_KM.toLocaleString()} km. Consider timing belt, fluids, brakes.`,
        dueDate: toISODateString(new Date(Date.now() + 14 * 86400000)),
        priority: "High",
        status: "Not Started",
        assignedTo: 2,
        project: "Vehicle Maintenance",
      })

      if (task) {
        created.push({ id: task.id, title: task.title })
      }
    }

    if (created.length > 0) {
      await step.run("send-notifications", async () => {
        await sendNotification({
          type: "system_alert",
          userId: getAdminNotificationRecipient(),
          title: `${created.length} vehicle(s) over 100k km - maintenance tasks created`,
          message: created.map((c) => c.title).join("; "),
          channels: ["in_app"],
          data: { taskIds: created.map((c) => c.id) },
          priority: "medium",
        })
        const charlId = BASEROW_ID_TO_APP_ID[2] ?? "charl"
        await sendNotification({
          type: "task_assigned",
          userId: charlId,
          title: "Vehicle maintenance tasks assigned",
          message: created.map((c) => c.title).join("; "),
          channels: ["in_app"],
          data: { taskIds: created.map((c) => c.id) },
          priority: "medium",
        })
      })
    }

    return { checked: true, tasksCreated: created.length }
  }
)

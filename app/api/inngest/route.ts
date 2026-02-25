import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { healthCheck } from "@/lib/inngest/functions"
import { kioskRequestSubmitted } from "@/lib/workflows/kiosk"
import { expenseCreated } from "@/lib/workflows/expense"
import { documentExpiryCheck } from "@/lib/workflows/document-expiry"
import { recurringTasksCreate } from "@/lib/workflows/recurring-tasks"
import { overtimeCalculate } from "@/lib/workflows/overtime"
import { taskCreated } from "@/lib/workflows/task-assignment"
import { incidentCreated } from "@/lib/workflows/incident"
import { maintenanceScheduled } from "@/lib/workflows/maintenance"
import { leaveBalanceUpdate } from "@/lib/workflows/leave-balance"
import { inventoryLowStock } from "@/lib/workflows/inventory-low-stock"
import { inventoryLowStockCron } from "@/lib/workflows/inventory-low-stock-cron"
import { taskOverdueCheck } from "@/lib/workflows/task-overdue"
import { docusealSubmissionCompleted } from "@/lib/workflows/docuseal-webhook"
import { shoppingListWeekly } from "@/lib/workflows/shopping-list-weekly"
import { projectSuggestionApproved } from "@/lib/workflows/project-suggestion"
import { vehicleMileageCheck } from "@/lib/workflows/vehicle-mileage"
import { inventoryExpiryCheck } from "@/lib/workflows/inventory-expiry"
import { reorderAutomation } from "@/lib/workflows/reorder-automation"
import { supplierOrderPlaced } from "@/lib/workflows/supplier-order"
import { purchaseOrderCreated } from "@/lib/workflows/purchase-order"
import { projectStarted } from "@/lib/workflows/project-started"
import { contractorMilestoneCompleted } from "@/lib/workflows/contractor-milestone"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    healthCheck,
    kioskRequestSubmitted,
    expenseCreated,
    documentExpiryCheck,
    recurringTasksCreate,
    overtimeCalculate,
    taskCreated,
    incidentCreated,
    maintenanceScheduled,
    leaveBalanceUpdate,
    inventoryLowStock,
    inventoryLowStockCron,
    taskOverdueCheck,
    docusealSubmissionCompleted,
    shoppingListWeekly,
    projectSuggestionApproved,
    vehicleMileageCheck,
    inventoryExpiryCheck,
    reorderAutomation,
    supplierOrderPlaced,
    purchaseOrderCreated,
    projectStarted,
    contractorMilestoneCompleted,
  ],
})

import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"
import { existsSync } from "fs"
import { mkdir, readFile, writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import { join } from "path"
import { lock } from "proper-lockfile"

const MILESTONE_STATUSES = ["Pending", "In Progress", "Paid", "Completed"] as const
type MilestoneStatus = (typeof MILESTONE_STATUSES)[number]

interface Milestone {
  stage: string
  percentage: number
  amount: number
  status: MilestoneStatus
  paidDate: string | null
  dueDate: string
}

interface Contractor {
  id: number
  name: string
  project: string
  contractAmount: number
  milestones: Milestone[]
  totalPaid: number
  remaining: number
  progress: number
}

const CONTRACTORS_PATH = join(process.cwd(), "data", "contractors.json")

const DEFAULT_CONTRACTORS: Contractor[] = [
  {
    id: 1,
    name: "BuildRight Construction",
    project: "Renovation Project",
    contractAmount: 85000,
    milestones: [
      { stage: "Deposit", percentage: 20, amount: 17000, status: "Paid", paidDate: "2024-12-15", dueDate: "2024-12-15" },
      { stage: "Foundation Complete", percentage: 30, amount: 25500, status: "Paid", paidDate: "2025-01-10", dueDate: "2025-01-10" },
      { stage: "Framing Complete", percentage: 25, amount: 21250, status: "In Progress", paidDate: null, dueDate: "2025-02-15" },
      { stage: "Final Completion", percentage: 25, amount: 21250, status: "Pending", paidDate: null, dueDate: "2025-03-30" },
    ],
    totalPaid: 42500,
    remaining: 42500,
    progress: 50,
  },
  {
    id: 2,
    name: "GreenScape Landscaping",
    project: "Garden Redesign",
    contractAmount: 28000,
    milestones: [
      { stage: "Deposit", percentage: 30, amount: 8400, status: "Paid", paidDate: "2025-01-05", dueDate: "2025-01-05" },
      { stage: "Phase 1 - Clearing", percentage: 35, amount: 9800, status: "In Progress", paidDate: null, dueDate: "2025-02-01" },
      { stage: "Final - Planting", percentage: 35, amount: 9800, status: "Pending", paidDate: null, dueDate: "2025-02-28" },
    ],
    totalPaid: 8400,
    remaining: 19600,
    progress: 30,
  },
  {
    id: 3,
    name: "SafeGuard Electrical",
    project: "Workshop Upgrade",
    contractAmount: 15500,
    milestones: [
      { stage: "Deposit", percentage: 40, amount: 6200, status: "Paid", paidDate: "2025-01-12", dueDate: "2025-01-12" },
      { stage: "Completion", percentage: 60, amount: 9300, status: "Pending", paidDate: null, dueDate: "2025-02-10" },
    ],
    totalPaid: 6200,
    remaining: 9300,
    progress: 40,
  },
]

async function loadContractors(): Promise<Contractor[]> {
  try {
    const data = await readFile(CONTRACTORS_PATH, "utf-8")
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : DEFAULT_CONTRACTORS
  } catch {
    return DEFAULT_CONTRACTORS
  }
}

async function saveContractors(contractors: Contractor[]): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true })
  // Ensure file exists before locking to prevent ENOENT
  if (!existsSync(CONTRACTORS_PATH)) {
    await writeFile(CONTRACTORS_PATH, "[]", "utf-8")
  }
  // Acquire exclusive file lock to prevent lost updates from concurrent PATCHes
  const release = await lock(CONTRACTORS_PATH, {
    retries: { retries: 5, minTimeout: 50, maxTimeout: 500 },
    stale: 5000,
  })
  try {
    await writeFile(CONTRACTORS_PATH, JSON.stringify(contractors, null, 2), "utf-8")
  } finally {
    await release()
  }
}

function recalcContractor(c: Contractor): Contractor {
  const paid = c.milestones.filter((m) => m.status === "Paid" || m.status === "Completed")
  const totalPaid = paid.reduce((s, m) => s + m.amount, 0)
  const remaining = c.contractAmount - totalPaid
  // Protect against division by zero: only calculate progress when contractAmount > 0
  const progress = c.contractAmount > 0
    ? Math.min(100, Math.max(0, Math.round((totalPaid / c.contractAmount) * 100)))
    : 0
  return { ...c, totalPaid, remaining, progress }
}

export async function GET() {
  try {
    const contractors = await loadContractors()
    // Protect against division by zero when contractors array is empty
    const averageProgress = contractors.length
      ? Math.round(contractors.reduce((sum, c) => sum + c.progress, 0) / contractors.length)
      : 0
    const summary = {
      totalContracts: contractors.length,
      totalContractValue: contractors.reduce((sum, c) => sum + c.contractAmount, 0),
      totalPaid: contractors.reduce((sum, c) => sum + c.totalPaid, 0),
      totalRemaining: contractors.reduce((sum, c) => sum + c.remaining, 0),
      averageProgress,
    }
    return NextResponse.json({ contractors, summary })
  } catch (err) {
    logger.error("Failed to load contractors", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to load contractors" }, { status: 500 })
  }
}

export const PATCH = withRole("admin")(async (request, context) => {
  try {
    const body = await request.json()
    const { contractorId, milestoneIndex, status, paidDate } = body

    if (contractorId == null || milestoneIndex == null) {
      return NextResponse.json(
        { error: "contractorId and milestoneIndex are required" },
        { status: 400 }
      )
    }

    const contractors = await loadContractors()
    const cIdx = contractors.findIndex((c) => c.id === contractorId)
    if (cIdx === -1) return NextResponse.json({ error: "Contractor not found" }, { status: 404 })

    const contractor = contractors[cIdx]
    const mIdx = Number(milestoneIndex)
    if (mIdx < 0 || mIdx >= contractor.milestones.length) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    const prevStatus = contractor.milestones[mIdx].status
    const milestone = contractor.milestones[mIdx]

    if (status) {
      // Validate status against allowed whitelist
      if (!MILESTONE_STATUSES.includes(status as MilestoneStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed values: ${MILESTONE_STATUSES.join(", ")}` },
          { status: 400 }
        )
      }
      milestone.status = status as MilestoneStatus
    }
    if (paidDate !== undefined) {
      milestone.paidDate = paidDate || null
    }

    contractors[cIdx] = recalcContractor(contractor)

    // Persist changes before emitting events to ensure data is saved
    await saveContractors(contractors)

    // Emit event only after successful persistence
    if (
      (milestone.status === "Paid" || milestone.status === "Completed") &&
      prevStatus !== "Paid" &&
      prevStatus !== "Completed"
    ) {
      await routeToInngest({
        name: "house-of-veritas/contractor.milestone.completed",
        data: {
          contractorId: contractor.id,
          contractorName: contractor.name,
          project: contractor.project,
          stage: milestone.stage,
          amount: milestone.amount,
        },
      })
    }
    return NextResponse.json({ contractor: contractors[cIdx] })
  } catch (err) {
    logger.error("Failed to update contractor milestone", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to update contractor milestone" }, { status: 500 })
  }
})

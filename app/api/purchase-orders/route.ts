import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"
import { randomUUID } from "crypto"
import { existsSync } from "fs"
import { mkdir, open, readFile, rename, stat, unlink, writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import { join } from "path"
import { pid } from "process"

interface PurchaseOrder {
  id: string
  vendor: string
  amount: number
  items: string
  status: "draft" | "pending_approval" | "approved" | "ordered" | "received"
  createdBy: string
  createdAt: string
  updatedAt: string
}

const PO_PATH = join(process.cwd(), "data", "purchase-orders.json")

async function loadPOs(): Promise<PurchaseOrder[]> {
  try {
    const data = await readFile(PO_PATH, "utf-8")
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const LOCK_TTL_MS = 30000 // 30 seconds TTL for stale lock detection

async function acquireFileLock(
  targetPath: string,
  retries = 5,
  delayMs = 50
): Promise<() => Promise<void>> {
  const lockPath = `${targetPath}.lock`
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const handle = await open(lockPath, "wx")
      // Write timestamp and PID to the lock file for stale lock detection
      const lockData = JSON.stringify({ timestamp: Date.now(), pid })
      await handle.write(lockData)
      await handle.sync()
      return async () => {
        await handle.close()
        await unlink(lockPath).catch(() => { })
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException
      if (err?.code !== "EEXIST" || attempt === retries) {
        throw error
      }

      // Check for stale lock
      try {
        const lockStats = await stat(lockPath)
        const lockAge = Date.now() - lockStats.mtime.getTime()

        if (lockAge > LOCK_TTL_MS) {
          // Lock is stale, try to remove it
          try {
            // Read lock file to verify it's truly stale (check timestamp inside)
            const lockContent = await readFile(lockPath, "utf-8")
            let lockData: { timestamp?: number; pid?: number } | undefined
            try {
              lockData = JSON.parse(lockContent)
            } catch {
              // Invalid JSON, treat as stale
            }

            const timestamp = lockData?.timestamp
            const isStale = !timestamp || (Date.now() - timestamp > LOCK_TTL_MS)

            if (isStale) {
              await unlink(lockPath)
              // Retry immediately without counting this as an attempt
              continue
            }
          } catch (readError) {
            // If we can't read the lock file, it might have been removed by another process
            // Retry immediately
            continue
          }
        }
      } catch (statError) {
        // Lock file might have been removed between EEXIST and stat
        // Retry immediately
        continue
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error("Failed to acquire lock")
}

async function savePOs(orders: PurchaseOrder[]): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true })

  // Acquire lock first to prevent race conditions during initialization
  const release = await acquireFileLock(PO_PATH)
  try {
    // Re-check and initialize inside the locked section
    if (!existsSync(PO_PATH)) {
      await writeFile(PO_PATH, "[]", "utf-8")
    }

    // Atomic write: write to temp file then rename
    const tempPath = `${PO_PATH}.tmp`
    await writeFile(tempPath, JSON.stringify(orders, null, 2), "utf-8")
    await rename(tempPath, PO_PATH)
  } finally {
    await release()
  }
}

export async function GET() {
  try {
    const orders = await loadPOs()
    return NextResponse.json({ purchaseOrders: orders })
  } catch (err) {
    logger.error("Failed to load purchase orders", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to load purchase orders" }, { status: 500 })
  }
}

export const POST = withRole("admin", "operator")(async (request, context) => {
  try {
    const body = await request.json()
    const { vendor, amount, items } = body

    if (!vendor || amount == null) {
      return NextResponse.json(
        { error: "vendor and amount are required" },
        { status: 400 }
      )
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive finite number" },
        { status: 400 }
      )
    }

    const orders = await loadPOs()
    const id = `po-${randomUUID()}`
    const now = new Date().toISOString()

    const po: PurchaseOrder = {
      id,
      vendor,
      amount: numericAmount,
      items: items ?? "",
      status: "pending_approval",
      createdBy: context.userId,
      createdAt: now,
      updatedAt: now,
    }

    orders.push(po)
    await savePOs(orders)

    // Emit event after persistence - wrap in try/catch to avoid 500 on event failure
    try {
      await routeToInngest({
        name: "house-of-veritas/purchase_order.created",
        data: {
          poId: id,
          vendor,
          amount: po.amount,
          items: po.items,
          createdBy: context.userId,
        },
      })
    } catch (eventError) {
      logger.error("Failed to emit purchase_order.created event", {
        poId: id,
        error: eventError instanceof Error ? eventError.message : String(eventError),
      })
      // Do not rethrow - the PO was successfully created
    }

    return NextResponse.json({ purchaseOrder: po })
  } catch (err) {
    logger.error("Failed to create purchase order", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
  }
})

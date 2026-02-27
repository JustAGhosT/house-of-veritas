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
  delayMs = 50,
  maxStaleRecoveries = 10
): Promise<() => Promise<void>> {
  const lockPath = `${targetPath}.lock`
  let attempt = 0
  let staleRecoveryCount = 0
  while (attempt <= retries) {
    try {
      const handle = await open(lockPath, "wx")
      try {
        // Write timestamp and PID to the lock file for stale lock detection
        const lockData = JSON.stringify({ timestamp: Date.now(), pid })
        await handle.write(lockData)
        await handle.sync()
        return async () => {
          await handle.close()
          await unlink(lockPath).catch(() => { })
        }
      } catch (error) {
        await handle.close().catch(() => { })
        await unlink(lockPath).catch(() => { })
        throw error
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
              // Atomically rename the stale lock to avoid race conditions
              const backupPath = `${lockPath}.stale.${pid}.${Date.now()}`
              try {
                await rename(lockPath, backupPath)
                // Rename succeeded - we removed the exact stale file
                await unlink(backupPath).catch(() => { })
                // Retry immediately but track stale recovery attempts
                staleRecoveryCount++
                if (staleRecoveryCount > maxStaleRecoveries) {
                  throw new Error(`Exceeded max stale lock recovery attempts (${maxStaleRecoveries})`)
                }
                continue
              } catch (renameError) {
                const renameErr = renameError as NodeJS.ErrnoException
                // If rename failed (ENOENT or EEXIST), someone else changed the lock
                if (renameErr?.code === "ENOENT" || renameErr?.code === "EEXIST") {
                  // Another process modified the lock, continue the loop
                  staleRecoveryCount++
                  if (staleRecoveryCount > maxStaleRecoveries) {
                    throw new Error(`Exceeded max stale lock recovery attempts (${maxStaleRecoveries})`)
                  }
                  continue
                }
                throw renameError
              }
            }
          } catch (readError) {
            // If we can't read the lock file, it might have been removed by another process
            // Retry immediately but track stale recovery attempts
            staleRecoveryCount++
            if (staleRecoveryCount > maxStaleRecoveries) {
              throw new Error(`Exceeded max stale lock recovery attempts (${maxStaleRecoveries})`)
            }
            continue
          }
        }
      } catch (statError) {
        // Lock file might have been removed between EEXIST and stat
        // Retry immediately but track stale recovery attempts
        staleRecoveryCount++
        if (staleRecoveryCount > maxStaleRecoveries) {
          throw new Error(`Exceeded max stale lock recovery attempts (${maxStaleRecoveries})`)
        }
        continue
      }

      attempt++
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error("Failed to acquire lock")
}

async function savePOsUnsafe(orders: PurchaseOrder[]): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true })

  // Re-check and initialize
  if (!existsSync(PO_PATH)) {
    await writeFile(PO_PATH, "[]", "utf-8")
  }

  // Atomic write: write to temp file then rename
  const tempPath = `${PO_PATH}.tmp`
  await writeFile(tempPath, JSON.stringify(orders, null, 2), "utf-8")
  await rename(tempPath, PO_PATH)
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

    // Acquire lock and perform read-modify-write atomically
    const release = await acquireFileLock(PO_PATH)
    try {
      const orders = await loadPOs()
      orders.push(po)
      await savePOsUnsafe(orders)
    } finally {
      await release()
    }

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

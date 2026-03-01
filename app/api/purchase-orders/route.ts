import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"
import { randomUUID } from "crypto"
import { mkdir, readFile, rename, writeFile } from "fs/promises"
import Redis from "ioredis"
import { NextResponse } from "next/server"
import { join } from "path"

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

const LOCK_TTL_MS = 30000 // 30 seconds TTL for Redis lock

// Redis client for distributed locking
let redis: Redis | null = null
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times < 3 ? 1000 : null),
        lazyConnect: true,
      })
      redis.on("error", (err) => {
        logger.warn("Redis lock connection error", { error: err.message })
      })
    } catch (err) {
      logger.warn("Redis lock init failed", {
        error: err instanceof Error ? err.message : String(err),
      })
      return null
    }
  }
  return redis
}

// Lua script for atomic check-and-delete (prevents releasing someone else's lock)
const UNLOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`

class LockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LockError"
  }
}

async function acquireDistributedLock(
  lockKey: string,
  retries = 5,
  delayMs = 50
): Promise<() => Promise<void>> {
  const token = randomUUID()
  const redisClient = getRedis()

  // If Redis is not available, fall back to in-memory lock (dev only)
  if (!redisClient) {
    logger.warn("Redis not available, using in-memory lock fallback (dev only)")
    let acquired = false
    let attempt = 0
    while (attempt <= retries && !acquired) {
      if (!globalThis._inMemoryLocks) {
        globalThis._inMemoryLocks = new Map()
      }
      // Check and clean expired locks
      const existing = globalThis._inMemoryLocks.get(lockKey)
      if (existing) {
        if (Date.now() > existing.expiry) {
          // Lock expired, clean it up
          clearTimeout(existing.timer)
          globalThis._inMemoryLocks.delete(lockKey)
        }
      }
      if (!globalThis._inMemoryLocks.has(lockKey)) {
        // Set lock with TTL timer
        const timer = setTimeout(() => {
          globalThis._inMemoryLocks?.delete(lockKey)
        }, LOCK_TTL_MS)
        globalThis._inMemoryLocks.set(lockKey, {
          token,
          expiry: Date.now() + LOCK_TTL_MS,
          timer,
        })
        acquired = true
        break
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
      attempt++
    }
    if (!acquired) {
      throw new LockError(`Failed to acquire in-memory lock after ${retries} retries`)
    }
    return async () => {
      const store = globalThis._inMemoryLocks
      const entry = store?.get(lockKey)
      if (entry && entry.token === token) {
        clearTimeout(entry.timer)
        store?.delete(lockKey)
      }
    }
  }

  // Redis-based distributed lock with bounded retry
  let attempt = 0
  while (attempt <= retries) {
    // Try to acquire lock with SET NX PX (set if not exists with TTL)
    const acquired = await redisClient.set(lockKey, token, "PX", LOCK_TTL_MS, "NX")
    if (acquired === "OK") {
      // Lock acquired successfully
      return async () => {
        try {
          // Use Lua script to only delete if we still own the lock
          await redisClient.eval(UNLOCK_SCRIPT, 1, lockKey, token)
        } catch (err) {
          logger.warn("Failed to release Redis lock", {
            lockKey,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // Lock not acquired, wait and retry with exponential backoff
    if (attempt < retries) {
      const backoffMs = delayMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, Math.min(backoffMs, 1000)))
    }
    attempt++
  }

  throw new LockError(`Failed to acquire distributed lock after ${retries} retries`)
}

// In-memory lock entry with metadata for TTL and cleanup
type InMemoryLockEntry = {
  token: string
  expiry: number
  timer: ReturnType<typeof setTimeout>
}

declare global {
  var _inMemoryLocks: Map<string, InMemoryLockEntry> | undefined
}

async function savePOsWithLock(orders: PurchaseOrder[], _lockToken: string): Promise<void> {
  // The lock token is passed to ensure callers have acquired the lock
  // In a more complex system, this could validate against a registry

  await mkdir(join(process.cwd(), "data"), { recursive: true })

  // Always use atomic write pattern (no existsSync check needed)
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

export const POST = withRole(
  "admin",
  "operator"
)(async (request, context) => {
  try {
    const body = await request.json()
    const { vendor, amount, items } = body

    if (!vendor || amount == null) {
      return NextResponse.json({ error: "vendor and amount are required" }, { status: 400 })
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
    let release: (() => Promise<void>) | undefined
    try {
      release = await acquireDistributedLock(`lock:${PO_PATH}`)
      const orders = await loadPOs()
      orders.push(po)
      // Pass lock token (for potential validation in savePOsWithLock)
      await savePOsWithLock(orders, "acquired")
    } catch (lockErr) {
      if (lockErr instanceof LockError) {
        logger.error("Failed to acquire lock for purchase order creation", {
          error: lockErr.message,
        })
        return NextResponse.json(
          { error: "Resource temporarily locked due to high contention. Please retry." },
          { status: 423 }
        )
      }
      throw lockErr
    } finally {
      if (release) await release()
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

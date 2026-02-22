import Redis from "ioredis"
import { logger } from "@/lib/logger"

const REDIS_URL = process.env.REDIS_URL

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!REDIS_URL) return null
  if (!redis) {
    try {
      redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times < 3 ? 1000 : null),
        lazyConnect: true,
      })
      redis.on("error", (err) => {
        logger.warn("Redis rate-limit connection error", {
          error: err.message,
        })
      })
    } catch (err) {
      logger.warn("Redis rate-limit init failed", {
        error: err instanceof Error ? err.message : String(err),
      })
      return null
    }
  }
  return redis
}

export function isRedisRateLimitConfigured(): boolean {
  return !!REDIS_URL
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const inMemoryStore = new Map<string, RateLimitEntry>()
const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanupInMemory() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of inMemoryStore) {
    if (entry.resetAt < now) inMemoryStore.delete(key)
  }
}

async function rateLimitRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const r = getRedis()
  if (!r) {
    return rateLimitInMemory(key, limit, windowMs)
  }

  const redisKey = `ratelimit:${key}`
  const now = Date.now()

  try {
    const count = await r.incr(redisKey)
    const ttl = await r.pttl(redisKey)
    if (ttl === -1) {
      await r.pexpire(redisKey, windowMs)
    }
    const resetAt = ttl > 0 ? now + ttl : now + windowMs
    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)
    return { allowed, remaining, resetAt }
  } catch (err) {
    logger.warn("Redis rate-limit error, falling back to in-memory", {
      error: err instanceof Error ? err.message : String(err),
    })
    return rateLimitInMemory(key, limit, windowMs)
  }
}

function rateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupInMemory()

  const now = Date.now()
  const entry = inMemoryStore.get(key)

  if (!entry || entry.resetAt < now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count++
  const allowed = entry.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  return rateLimitInMemory(key, limit, windowMs)
}

export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (isRedisRateLimitConfigured()) {
    return rateLimitRedis(key, limit, windowMs)
  }
  return rateLimitInMemory(key, limit, windowMs)
}

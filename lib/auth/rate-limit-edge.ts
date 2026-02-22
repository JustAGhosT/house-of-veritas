/**
 * Edge-safe rate limiter for middleware. Uses in-memory store only.
 * Do NOT import ioredis or any Node.js-specific modules here -
 * middleware runs on Edge Runtime where process.version is undefined.
 */

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

export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
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

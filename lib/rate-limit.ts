import { NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (request: NextRequest) => string | Promise<string>
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory rate limit store
// Note: For production with multiple instances, consider using Redis (Upstash)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000) // 5 minutes
}

/**
 * Simple in-memory rate limiter
 * For distributed systems, use Redis-based solution (e.g., @upstash/ratelimit)
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator
      ? await config.keyGenerator(request)
      : getClientIdentifier(request)

    const now = Date.now()
    const entry = rateLimitStore.get(key)

    // Check if entry exists and is still valid
    if (entry && entry.resetAt > now) {
      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        return NextResponse.json(
          {
            error: "Te veel verzoeken. Probeer het later opnieuw.",
            retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(entry.resetAt).toISOString(),
            },
          }
        )
      }

      // Increment count
      entry.count++
      rateLimitStore.set(key, entry)
    } else {
      // Create new entry
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      })
    }

    // Get current entry for response headers
    const currentEntry = rateLimitStore.get(key)!
    const remaining = Math.max(0, config.maxRequests - currentEntry.count)

    // Add rate limit headers to response (will be set by the route handler)
    return null
  }
}

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  return `rate-limit:${ip}`
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(key: string, config: RateLimitConfig): Record<string, string> {
  const entry = rateLimitStore.get(key)
  if (!entry) {
    return {
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": config.maxRequests.toString(),
      "X-RateLimit-Reset": new Date(Date.now() + config.windowMs).toISOString(),
    }
  }

  const remaining = Math.max(0, config.maxRequests - entry.count)

  return {
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(entry.resetAt).toISOString(),
  }
}

/**
 * Rate limit by IP address (default)
 */
export function rateLimitByIp(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: getClientIdentifier,
  })
}

/**
 * Rate limit by email (for password reset, etc.)
 */
export function rateLimitByEmail(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: async (request) => {
      try {
        const body = await request.clone().json()
        const email = body?.email || "unknown"
        return `rate-limit:email:${email.toLowerCase()}`
      } catch {
        return getClientIdentifier(request)
      }
    },
  })
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const authRateLimit = rateLimitByIp({
  maxRequests: 5, // 5 login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
})

export const registerRateLimit = rateLimitByIp({
  maxRequests: 10, // 10 registrations (was 3, verhoogd voor development/testing)
  windowMs: 60 * 60 * 1000, // 1 hour
})

export const passwordResetRateLimit = rateLimitByEmail({
  maxRequests: 3, // 3 password resets per email
  windowMs: 60 * 60 * 1000, // 1 hour
})

export const emailVerificationRateLimit = rateLimitByEmail({
  maxRequests: 10, // 10 verification attempts per email
  windowMs: 60 * 60 * 1000, // 1 hour
})

/**
 * Unblock a specific IP address
 */
export function unblockIp(ip: string): boolean {
  const key = `rate-limit:${ip}`
  if (rateLimitStore.has(key)) {
    rateLimitStore.delete(key)
    return true
  }
  return false
}

/**
 * Unblock by email
 */
export function unblockEmail(email: string): boolean {
  const key = `rate-limit:email:${email.toLowerCase()}`
  if (rateLimitStore.has(key)) {
    rateLimitStore.delete(key)
    return true
  }
  return false
}

/**
 * Get all currently rate-limited entries
 */
export function getBlockedEntries(): Array<{ key: string; count: number; resetAt: Date; remainingSeconds: number }> {
  const now = Date.now()
  const entries: Array<{ key: string; count: number; resetAt: Date; remainingSeconds: number }> = []
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt > now) {
      entries.push({
        key: key.replace('rate-limit:', ''),
        count: entry.count,
        resetAt: new Date(entry.resetAt),
        remainingSeconds: Math.ceil((entry.resetAt - now) / 1000)
      })
    }
  }
  
  return entries
}

/**
 * Clear all rate limit entries (use with caution!)
 */
export function clearAllRateLimits(): number {
  const count = rateLimitStore.size
  rateLimitStore.clear()
  return count
}


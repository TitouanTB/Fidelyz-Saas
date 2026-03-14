export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  reset: number;
}

const cache = new Map<string, { count: number; expiresAt: number }>();

/**
 * Lightweight in-memory rate limiter for Next.js API routes/middleware.
 * NOTE: For production at scale, use Redis (e.g., Upstash).
 */
export async function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): Promise<{ success: boolean; info: RateLimitInfo }> {
  const now = Date.now();
  const bucket = cache.get(identifier);

  if (!bucket || bucket.expiresAt < now) {
    const newBucket = { count: 1, expiresAt: now + windowMs };
    cache.set(identifier, newBucket);
    return {
      success: true,
      info: { limit, current: 1, remaining: limit - 1, reset: newBucket.expiresAt },
    };
  }

  bucket.count++;
  const success = bucket.count <= limit;

  return {
    success,
    info: {
      limit,
      current: bucket.count,
      remaining: Math.max(0, limit - bucket.count),
      reset: bucket.expiresAt,
    },
  };
}

// Cleanup interval to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (value.expiresAt < now) cache.delete(key);
    }
  }, 1000 * 60 * 5); // Every 5 minutes
}

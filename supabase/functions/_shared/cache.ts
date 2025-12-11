// Server-side caching utility for Edge Functions
// Uses in-memory cache with TTL support

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

class EdgeCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits = 0;
  private misses = 0;
  private maxSize = 500;
  private cleanupInterval: number | null = null;

  constructor() {
    // Cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000) as unknown as number;
  }

  // Get cached value
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.data as T;
  }

  // Set cached value with TTL
  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    // Evict if at max capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      hits: 0,
    });
  }

  // Get or set pattern - returns cached value or executes fn and caches result
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs: number = 60000
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`[EdgeCache] Hit: ${key}`);
      return cached;
    }

    console.log(`[EdgeCache] Miss: ${key}`);
    const result = await fn();
    this.set(key, result, ttlMs);
    return result;
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Delete by prefix (useful for invalidating related entries)
  deleteByPrefix(prefix: string): number {
    let deleted = 0;
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deleted++;
      }
    });
    return deleted;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < lruTime) {
        lruTime = entry.timestamp;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`[EdgeCache] Evicted LRU: ${lruKey}`);
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[EdgeCache] Cleaned ${cleaned} expired entries`);
    }
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance
export const edgeCache = new EdgeCache();

// Helper function to create cache key from request
export function createCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}=${JSON.stringify(params[k])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

// Response caching headers helper
export function getCacheHeaders(maxAge: number = 60): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`,
    'CDN-Cache-Control': `max-age=${maxAge * 2}`,
    'Vary': 'Accept-Encoding',
  };
}

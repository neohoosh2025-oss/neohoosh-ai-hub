// Request Queue with Rate Limiting, Caching, Deduplication, and Retry Logic
// Designed to handle high-volume requests efficiently

interface QueuedRequest {
  id: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
  priority: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface InFlightRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private concurrentLimit = 5;
  private activeRequests = 0;
  private requestsPerSecond = 50;
  private requestTimestamps: number[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private inFlightRequests: Map<string, InFlightRequest> = new Map();
  private circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
    threshold: 5,
    resetTimeout: 30000,
  };

  // Add request to queue with priority and deduplication
  async enqueue<T>(
    key: string,
    execute: () => Promise<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      cacheTTL?: number;
      skipCache?: boolean;
      deduplicate?: boolean;
    } = {}
  ): Promise<T> {
    const { priority = 1, maxRetries = 3, cacheTTL = 60000, skipCache = false, deduplicate = true } = options;

    // Check cache first
    if (!skipCache) {
      const cached = this.getFromCache(key);
      if (cached !== null) {
        console.log(`[RequestQueue] Cache hit for: ${key}`);
        return cached;
      }
    }

    // Check for in-flight duplicate request (deduplication)
    if (deduplicate) {
      const inFlight = this.inFlightRequests.get(key);
      if (inFlight && Date.now() - inFlight.timestamp < 30000) {
        console.log(`[RequestQueue] Deduplicating request: ${key}`);
        return inFlight.promise as Promise<T>;
      }
    }

    // Check circuit breaker
    if (this.isCircuitOpen()) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    const requestPromise = new Promise<T>((resolve, reject) => {
      const request: QueuedRequest = {
        id: key,
        execute: async () => {
          const result = await execute();
          if (cacheTTL > 0) {
            this.setCache(key, result, cacheTTL);
          }
          return result;
        },
        resolve: (value) => {
          this.inFlightRequests.delete(key);
          resolve(value);
        },
        reject: (error) => {
          this.inFlightRequests.delete(key);
          reject(error);
        },
        retries: maxRetries,
        priority,
      };

      // Insert by priority (higher priority first)
      const insertIndex = this.queue.findIndex(r => r.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      this.processQueue();
    });

    // Track in-flight request for deduplication
    if (deduplicate) {
      this.inFlightRequests.set(key, {
        promise: requestPromise,
        timestamp: Date.now(),
      });
    }

    return requestPromise;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    if (this.activeRequests >= this.concurrentLimit) return;
    if (!this.canMakeRequest()) return;

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit && this.canMakeRequest()) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;
      this.recordRequest();

      this.executeRequest(request).finally(() => {
        this.activeRequests--;
        this.processQueue();
      });
    }

    this.processing = false;
  }

  private async executeRequest(request: QueuedRequest) {
    try {
      const result = await request.execute();
      this.recordSuccess();
      request.resolve(result);
    } catch (error: any) {
      this.recordFailure();

      // Retry logic with exponential backoff
      if (request.retries > 0 && this.shouldRetry(error)) {
        const delay = Math.pow(2, 3 - request.retries) * 1000;
        console.log(`[RequestQueue] Retrying ${request.id} in ${delay}ms (${request.retries} retries left)`);
        
        await this.sleep(delay);
        request.retries--;
        this.queue.unshift(request);
        this.processQueue();
      } else {
        request.reject(error);
      }
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, 429, 500-599
    if (!error.status) return true;
    if (error.status === 429) return true;
    if (error.status >= 500 && error.status < 600) return true;
    return false;
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 1000);
    return this.requestTimestamps.length < this.requestsPerSecond;
  }

  private recordRequest() {
    this.requestTimestamps.push(Date.now());
  }

  // Circuit breaker methods
  private isCircuitOpen(): boolean {
    if (!this.circuitBreaker.isOpen) return false;
    
    // Check if reset timeout has passed
    if (Date.now() - this.circuitBreaker.lastFailure > this.circuitBreaker.resetTimeout) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
      console.log('[RequestQueue] Circuit breaker reset');
      return false;
    }
    
    return true;
  }

  private recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
      console.log('[RequestQueue] Circuit breaker opened');
    }
  }

  private recordSuccess() {
    this.circuitBreaker.failures = 0;
  }

  // Cache methods
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
    
    // Limit cache size
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
  }

  clearCache() {
    this.cache.clear();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get queue stats
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      cacheSize: this.cache.size,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
      requestsInLastSecond: this.requestTimestamps.filter(t => Date.now() - t < 1000).length,
    };
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();

// Helper function for API calls
export async function queuedFetch<T>(
  url: string,
  options: RequestInit = {},
  queueOptions: {
    cacheKey?: string;
    priority?: number;
    maxRetries?: number;
    cacheTTL?: number;
    skipCache?: boolean;
  } = {}
): Promise<T> {
  const cacheKey = queueOptions.cacheKey || `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`;
  
  return requestQueue.enqueue(
    cacheKey,
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      return response.json();
    },
    queueOptions
  );
}

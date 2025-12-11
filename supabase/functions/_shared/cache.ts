// Server-side caching utility for Edge Functions
// Uses Supabase table as persistent cache storage

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface CacheResult<T> {
  data: T | null;
  hit: boolean;
}

// Get cached value from database
export async function getCache<T>(
  supabase: ReturnType<typeof createClient>,
  key: string
): Promise<CacheResult<T>> {
  try {
    const { data, error } = await supabase
      .from('api_cache')
      .select('cache_value, hits')
      .eq('cache_key', key)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { data: null, hit: false };
    }

    const cacheData = data as unknown as { cache_value: T; hits: number };

    // Update hit count async (fire and forget)
    supabase
      .from('api_cache')
      .update({ hits: (cacheData.hits || 0) + 1 })
      .eq('cache_key', key)
      .then(() => {});

    console.log(`[Cache] Hit: ${key}`);
    return { data: cacheData.cache_value, hit: true };
  } catch {
    return { data: null, hit: false };
  }
}

// Set cache value in database
export async function setCache<T>(
  supabase: ReturnType<typeof createClient>,
  key: string,
  value: T,
  ttlSeconds: number = 60
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  try {
    await supabase
      .from('api_cache')
      .upsert({
        cache_key: key,
        cache_value: value,
        expires_at: expiresAt,
        hits: 0,
      }, { 
        onConflict: 'cache_key' 
      });

    console.log(`[Cache] Set: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error('[Cache] Set error:', error);
  }
}

// Get or set pattern
export async function getOrSetCache<T>(
  supabase: ReturnType<typeof createClient>,
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = await getCache<T>(supabase, key);
  
  if (cached.hit && cached.data !== null) {
    return cached.data;
  }

  console.log(`[Cache] Miss: ${key}`);
  const result = await fn();
  await setCache(supabase, key, result, ttlSeconds);
  return result;
}

// Delete cache by key
export async function deleteCache(
  supabase: ReturnType<typeof createClient>,
  key: string
): Promise<void> {
  await supabase
    .from('api_cache')
    .delete()
    .eq('cache_key', key);
}

// Delete cache by prefix
export async function deleteCacheByPrefix(
  supabase: ReturnType<typeof createClient>,
  prefix: string
): Promise<number> {
  const { data } = await supabase
    .from('api_cache')
    .delete()
    .like('cache_key', `${prefix}%`)
    .select('id');

  const result = data as { id: string }[] | null;
  return result?.length || 0;
}

// Cleanup expired entries (call periodically)
export async function cleanupExpiredCache(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  const { data } = await supabase.rpc('cleanup_expired_cache');
  return (data as number) || 0;
}

// Create cache key from parameters
export function createCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(k => params[k] !== undefined && params[k] !== null)
    .map(k => `${k}=${JSON.stringify(params[k])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

// HTTP cache headers for CDN caching
export function getCacheHeaders(maxAge: number = 60): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`,
    'CDN-Cache-Control': `max-age=${maxAge * 2}`,
    'Vary': 'Accept-Encoding',
  };
}

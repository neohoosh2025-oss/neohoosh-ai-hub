import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Data that should be pre-warmed in cache
const WARM_TARGETS = [
  { key: 'homepage:features', table: 'homepage_features', filter: { is_active: true }, ttl: 300 },
  { key: 'homepage:stats', table: 'homepage_stats', filter: { is_active: true }, ttl: 300 },
  { key: 'homepage:tools', table: 'homepage_tools', filter: { is_active: true }, ttl: 300 },
  { key: 'articles:latest', table: 'articles', limit: 10, order: { column: 'created_at', ascending: false }, ttl: 180 },
  { key: 'products:all', table: 'products', ttl: 300 },
  { key: 'testimonials:approved', table: 'testimonials', filter: { approved: true }, ttl: 600 },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase config missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('[Cache Warming] Starting cache warming...');

    const results: { key: string; success: boolean; count?: number; error?: string }[] = [];

    for (const target of WARM_TARGETS) {
      try {
        // Build query
        let query = supabase.from(target.table).select('*');

        // Apply filters
        if (target.filter) {
          for (const [key, value] of Object.entries(target.filter)) {
            query = query.eq(key, value);
          }
        }

        // Apply order
        if (target.order) {
          query = query.order(target.order.column, { ascending: target.order.ascending });
        }

        // Apply limit
        if (target.limit) {
          query = query.limit(target.limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error(`[Cache Warming] Error fetching ${target.key}:`, error);
          results.push({ key: target.key, success: false, error: error.message });
          continue;
        }

        // Store in cache
        const expiresAt = new Date(Date.now() + target.ttl * 1000).toISOString();
        
        await supabase
          .from('api_cache')
          .upsert({
            cache_key: target.key,
            cache_value: data,
            expires_at: expiresAt,
            hits: 0,
          }, { onConflict: 'cache_key' });

        console.log(`[Cache Warming] Warmed ${target.key} with ${data?.length || 0} items`);
        results.push({ key: target.key, success: true, count: data?.length || 0 });

      } catch (error: any) {
        console.error(`[Cache Warming] Error for ${target.key}:`, error);
        results.push({ key: target.key, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Cache Warming] Completed: ${successCount}/${results.length} targets warmed`);

    return new Response(
      JSON.stringify({
        success: true,
        warmedCount: successCount,
        totalTargets: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Cache Warming] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

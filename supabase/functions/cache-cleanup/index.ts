import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('[Cache Cleanup] Starting cleanup...');

    // Delete expired cache entries
    const { data: deleted, error } = await supabase
      .from('api_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('[Cache Cleanup] Error:', error);
      throw error;
    }

    const deletedCount = (deleted as { id: string }[] | null)?.length || 0;
    console.log(`[Cache Cleanup] Deleted ${deletedCount} expired entries`);

    // Get cache stats
    const { count: totalEntries } = await supabase
      .from('api_cache')
      .select('*', { count: 'exact', head: true });

    const stats = {
      deletedCount,
      remainingEntries: totalEntries || 0,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, ...stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Cache Cleanup] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

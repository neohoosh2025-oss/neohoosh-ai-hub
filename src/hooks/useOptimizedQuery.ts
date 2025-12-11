import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { requestQueue, queuedFetch } from '@/utils/requestQueue';
import { supabase } from '@/integrations/supabase/client';

// Optimized Supabase query hook with caching and queuing
export function useOptimizedSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> & {
    cacheTTL?: number;
    priority?: number;
  }
) {
  const { cacheTTL = 30000, priority = 1, ...queryOptions } = options || {};

  return useQuery({
    queryKey,
    queryFn: () => requestQueue.enqueue(
      queryKey.join(':'),
      queryFn,
      { cacheTTL, priority }
    ),
    staleTime: cacheTTL,
    ...queryOptions,
  });
}

// Optimized edge function caller with queuing
export function useOptimizedEdgeFunction<TInput, TOutput>(
  functionName: string,
  options?: UseMutationOptions<TOutput, Error, TInput> & {
    priority?: number;
    maxRetries?: number;
  }
) {
  const { priority = 1, maxRetries = 3, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn: (input: TInput) => requestQueue.enqueue(
      `edge:${functionName}:${Date.now()}`,
      async () => {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: input,
        });
        
        if (error) throw error;
        return data as TOutput;
      },
      { priority, maxRetries, cacheTTL: 0 }
    ),
    ...mutationOptions,
  });
}

// Batch query hook for multiple items
export function useBatchQuery<T>(
  baseKey: string,
  ids: string[],
  fetchFn: (id: string) => Promise<T>,
  options?: {
    batchSize?: number;
    delayBetweenBatches?: number;
  }
) {
  const { batchSize = 10, delayBetweenBatches = 100 } = options || {};

  return useQuery({
    queryKey: [baseKey, ...ids],
    queryFn: async () => {
      const results: Map<string, T> = new Map();
      
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
          batch.map(id => 
            requestQueue.enqueue<T>(
              `${baseKey}:${id}`,
              () => fetchFn(id),
              { cacheTTL: 60000 }
            ).catch(() => null)
          )
        );
        
        batch.forEach((id, index) => {
          const result = batchResults[index];
          if (result !== null) {
            results.set(id, result);
          }
        });
        
        // Small delay between batches to prevent overwhelming
        if (i + batchSize < ids.length) {
          await new Promise(r => setTimeout(r, delayBetweenBatches));
        }
      }
      
      return results;
    },
    staleTime: 30000,
  });
}

// Debounced mutation for rapid updates
export function useDebouncedMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  options?: UseMutationOptions<TOutput, Error, TInput> & {
    debounceMs?: number;
  }
) {
  const { debounceMs = 300, ...mutationOptions } = options || {};
  let timeoutId: NodeJS.Timeout | null = null;
  let latestInput: TInput | null = null;
  let resolvers: Array<{ resolve: (v: TOutput) => void; reject: (e: Error) => void }> = [];

  return useMutation({
    mutationFn: (input: TInput) => {
      return new Promise<TOutput>((resolve, reject) => {
        latestInput = input;
        resolvers.push({ resolve, reject });
        
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
          const currentResolvers = [...resolvers];
          const currentInput = latestInput;
          resolvers = [];
          latestInput = null;
          
          try {
            const result = await mutationFn(currentInput!);
            currentResolvers.forEach(r => r.resolve(result));
          } catch (error) {
            currentResolvers.forEach(r => r.reject(error as Error));
          }
        }, debounceMs);
      });
    },
    ...mutationOptions,
  });
}

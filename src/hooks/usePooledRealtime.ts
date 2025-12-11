import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { connectionPool } from '@/utils/connectionPool';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UsePooledRealtimeOptions {
  table: string;
  schema?: string;
  event?: RealtimeEvent;
  filter?: string;
  onData: (payload: any) => void;
  enabled?: boolean;
}

export function usePooledRealtime({
  table,
  schema = 'public',
  event = '*',
  filter,
  onData,
  enabled = true,
}: UsePooledRealtimeOptions) {
  const subscriberId = useRef(`${table}-${Date.now()}-${Math.random()}`);
  const callbackRef = useRef(onData);
  
  // Keep callback ref updated
  callbackRef.current = onData;

  useEffect(() => {
    if (!enabled) return;

    const channelName = `${schema}:${table}:${event}:${filter || 'all'}`;
    
    const channel = connectionPool.getConnection(
      channelName,
      () => {
        const config: any = {
          event,
          schema,
        };
        
        if (filter) {
          config.filter = filter;
        }
        
        return supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { ...config, table },
            (payload) => callbackRef.current(payload)
          )
          .subscribe();
      },
      subscriberId.current
    );

    return () => {
      connectionPool.releaseConnection(channelName, subscriberId.current);
    };
  }, [table, schema, event, filter, enabled]);

  return {
    subscriberId: subscriberId.current,
  };
}

// Batch subscribe to multiple tables
export function usePooledRealtimeBatch(
  subscriptions: Array<{
    table: string;
    schema?: string;
    event?: RealtimeEvent;
    filter?: string;
    onData: (payload: any) => void;
  }>,
  enabled = true
) {
  const subscriberIds = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    subscriberIds.current = subscriptions.map((sub, i) => {
      const subscriberId = `batch-${sub.table}-${i}-${Date.now()}`;
      const channelName = `${sub.schema || 'public'}:${sub.table}:${sub.event || '*'}:${sub.filter || 'all'}`;
      
      connectionPool.getConnection(
        channelName,
        () => {
          const config: any = {
            event: sub.event || '*',
            schema: sub.schema || 'public',
          };
          
          if (sub.filter) {
            config.filter = sub.filter;
          }
          
          return supabase
            .channel(channelName)
            .on(
              'postgres_changes',
              { ...config, table: sub.table },
              sub.onData
            )
            .subscribe();
        },
        subscriberId
      );
      
      return subscriberId;
    });

    return () => {
      subscriptions.forEach((sub, i) => {
        const channelName = `${sub.schema || 'public'}:${sub.table}:${sub.event || '*'}:${sub.filter || 'all'}`;
        connectionPool.releaseConnection(channelName, subscriberIds.current[i]);
      });
    };
  }, [subscriptions, enabled]);
}

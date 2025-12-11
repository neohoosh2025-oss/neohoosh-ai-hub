import { useState, useEffect } from 'react';
import { requestQueue } from '@/utils/requestQueue';
import { connectionPool } from '@/utils/connectionPool';
import { Activity, Wifi, Database, Zap } from 'lucide-react';

interface SystemStats {
  queue: {
    queueLength: number;
    activeRequests: number;
    cacheSize: number;
    circuitBreakerOpen: boolean;
    requestsInLastSecond: number;
  };
  connections: {
    activeConnections: number;
    maxConnections: number;
  };
}

export function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        queue: requestQueue.getStats(),
        connections: connectionPool.getStats(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 p-2 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors"
        title="Show System Monitor"
      >
        <Activity className="w-4 h-4 text-primary" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          System Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          ✕
        </button>
      </div>

      {stats && (
        <div className="space-y-3 text-xs">
          {/* Request Queue */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="w-3 h-3" />
              Request Queue
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span>Queue:</span>
                <span className="text-foreground">{stats.queue.queueLength}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="text-foreground">{stats.queue.activeRequests}</span>
              </div>
              <div className="flex justify-between">
                <span>Cache:</span>
                <span className="text-foreground">{stats.queue.cacheSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Req/s:</span>
                <span className="text-foreground">{stats.queue.requestsInLastSecond}</span>
              </div>
            </div>
            {stats.queue.circuitBreakerOpen && (
              <div className="text-red-500 text-xs">⚠️ Circuit Breaker Open</div>
            )}
          </div>

          {/* Connections */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wifi className="w-3 h-3" />
              Connections
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="text-foreground">
                {stats.connections.activeConnections}/{stats.connections.maxConnections}
              </span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.queue.circuitBreakerOpen ? 'bg-red-500' : 
                stats.queue.activeRequests > 3 ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span className="text-muted-foreground">
                {stats.queue.circuitBreakerOpen ? 'Degraded' : 
                 stats.queue.activeRequests > 3 ? 'High Load' : 'Healthy'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

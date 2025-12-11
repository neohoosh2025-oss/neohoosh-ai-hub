// Connection Pool for WebSocket/Realtime connections
// Prevents opening too many simultaneous connections

interface PooledConnection {
  id: string;
  channel: any;
  lastUsed: number;
  subscribers: Set<string>;
}

class ConnectionPool {
  private connections: Map<string, PooledConnection> = new Map();
  private maxConnections = 10;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000);
  }

  // Get or create a pooled connection
  getConnection(
    channelName: string,
    createChannel: () => any,
    subscriberId: string
  ): any {
    let connection = this.connections.get(channelName);

    if (connection) {
      connection.lastUsed = Date.now();
      connection.subscribers.add(subscriberId);
      return connection.channel;
    }

    // Evict oldest if at max capacity
    if (this.connections.size >= this.maxConnections) {
      this.evictOldest();
    }

    const channel = createChannel();
    connection = {
      id: channelName,
      channel,
      lastUsed: Date.now(),
      subscribers: new Set([subscriberId]),
    };
    
    this.connections.set(channelName, connection);
    console.log(`[ConnectionPool] Created connection: ${channelName}`);
    
    return channel;
  }

  // Release a subscriber from a connection
  releaseConnection(channelName: string, subscriberId: string) {
    const connection = this.connections.get(channelName);
    if (!connection) return;

    connection.subscribers.delete(subscriberId);
    
    // If no more subscribers, mark for cleanup
    if (connection.subscribers.size === 0) {
      connection.lastUsed = Date.now() - 60000; // Mark as old for cleanup
    }
  }

  private evictOldest() {
    let oldest: PooledConnection | null = null;
    let oldestKey: string | null = null;

    this.connections.forEach((conn, key) => {
      if (!oldest || conn.lastUsed < oldest.lastUsed) {
        oldest = conn;
        oldestKey = key;
      }
    });

    if (oldestKey && oldest) {
      console.log(`[ConnectionPool] Evicting: ${oldestKey}`);
      try {
        (oldest as PooledConnection).channel?.unsubscribe?.();
      } catch (e) {
        // Ignore cleanup errors
      }
      this.connections.delete(oldestKey);
    }
  }

  private cleanup() {
    const now = Date.now();
    const maxAge = 120000; // 2 minutes

    this.connections.forEach((conn, key) => {
      if (conn.subscribers.size === 0 && now - conn.lastUsed > maxAge) {
        console.log(`[ConnectionPool] Cleaning up: ${key}`);
        try {
          conn.channel?.unsubscribe?.();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.connections.delete(key);
      }
    });
  }

  getStats() {
    return {
      activeConnections: this.connections.size,
      maxConnections: this.maxConnections,
      connections: Array.from(this.connections.entries()).map(([key, conn]) => ({
        id: key,
        subscribers: conn.subscribers.size,
        age: Date.now() - conn.lastUsed,
      })),
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.connections.forEach(conn => {
      try {
        conn.channel?.unsubscribe?.();
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    
    this.connections.clear();
  }
}

export const connectionPool = new ConnectionPool();

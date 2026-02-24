// Push notification utilities for PWA
// All functions are safe to call in SSR environments

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // This should be configured via environment

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  if (!isBrowser) return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Check if notifications are permitted
export const getNotificationPermission = (): NotificationPermission => {
  if (!isBrowser || typeof Notification === 'undefined') return 'denied';
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

// Subscribe to push notifications
export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await (registration as any).pushManager?.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // Subscribe with VAPID key (only if configured)
    if (VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY !== 'YOUR_VAPID_PUBLIC_KEY') {
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      return subscription;
    } else {
      // Subscribe without VAPID for basic push support
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true
      });
      return subscription;
    }
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (): Promise<boolean> => {
  if (!isBrowser) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager?.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
};

// Show a local notification
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/favicon.png',
      badge: '/favicon.png',
      dir: 'rtl',
      lang: 'fa',
      ...options
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Check if app is installed (standalone mode)
export const isAppInstalled = (): boolean => {
  if (!isBrowser) return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
};

// Check online status
export const isOnline = (): boolean => {
  if (!isBrowser) return true;
  return navigator.onLine;
};

// Listen for online/offline events
export const addNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  if (!isBrowser) return () => {};
  
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isOnline,
  addNetworkListeners,
  isAppInstalled
} from '@/utils/pushNotifications';

export interface UsePWAReturn {
  // Installation
  isInstalled: boolean;
  canInstall: boolean;
  installPrompt: (() => Promise<void>) | null;
  
  // Notifications
  notificationPermission: NotificationPermission;
  isPushSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  
  // Network
  isOnline: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = (): UsePWAReturn => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [online, setOnline] = useState(true);

  // Check installation status
  useEffect(() => {
    setIsInstalled(isAppInstalled());
    setOnline(isOnline());
    
    if (isPushSupported()) {
      setNotificationPermission(getNotificationPermission());
    }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Listen for network changes
  useEffect(() => {
    const cleanup = addNetworkListeners(
      () => setOnline(true),
      () => setOnline(false)
    );
    return cleanup;
  }, []);

  // Install prompt handler
  const installPrompt = useCallback(async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  // Subscribe to push
  const subscribe = useCallback(async () => {
    const subscription = await subscribeToPush();
    return !!subscription;
  }, []);

  // Unsubscribe from push
  const unsubscribe = useCallback(async () => {
    return await unsubscribeFromPush();
  }, []);

  return {
    isInstalled,
    canInstall,
    installPrompt: canInstall ? installPrompt : null,
    notificationPermission,
    isPushSupported: isPushSupported(),
    requestPermission,
    subscribe,
    unsubscribe,
    isOnline: online
  };
};

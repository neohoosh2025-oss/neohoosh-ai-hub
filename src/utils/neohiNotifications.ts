// NEOHI Notification utilities
import { showNotification, getNotificationPermission, requestNotificationPermission } from './pushNotifications';
import { vibrateMessage } from './callRingtone';

// Show notification for incoming call
export const showCallNotification = async (
  callerName: string,
  callType: 'voice' | 'video',
  callerAvatar?: string
): Promise<void> => {
  const title = callType === 'video' ? 'تماس تصویری' : 'تماس صوتی';
  const body = `${callerName} در حال تماس با شماست`;

  await showNotification(title, {
    body,
    icon: callerAvatar || '/favicon.png',
    badge: '/favicon.png',
    tag: 'incoming-call',
    requireInteraction: true,
  } as NotificationOptions);
};

// Show notification for new message
export const showMessageNotification = async (
  senderName: string,
  messagePreview: string,
  senderAvatar?: string,
  chatId?: string
): Promise<void> => {
  // Vibrate for message
  vibrateMessage();

  await showNotification(senderName, {
    body: messagePreview,
    icon: senderAvatar || '/favicon.png',
    badge: '/favicon.png',
    tag: `message-${chatId || 'new'}`,
    data: { chatId }
  } as NotificationOptions);
};

// Request notification permission with user-friendly prompt
export const ensureNotificationPermission = async (): Promise<boolean> => {
  const currentPermission = getNotificationPermission();
  
  if (currentPermission === 'granted') return true;
  if (currentPermission === 'denied') return false;
  
  // Request permission
  const permission = await requestNotificationPermission();
  return permission === 'granted';
};

// Check if app is in background
export const isAppInBackground = (): boolean => {
  return document.hidden || document.visibilityState === 'hidden';
};

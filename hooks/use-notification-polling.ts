import { useEffect, useRef } from 'react';
import type { UseNotificationsReturn } from './useNotifications';

interface UseNotificationPollingOptions {
  interval?: number;
  enabled?: boolean;
}

export const useNotificationPolling = (
  notificationsHook: UseNotificationsReturn,
  options: UseNotificationPollingOptions = {}
): void => {
  const { interval = 30000, enabled = false } = options;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { refetch } = notificationsHook;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    intervalRef.current = setInterval(() => {
      refetch().catch(() => {});
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch, interval, enabled]);
};

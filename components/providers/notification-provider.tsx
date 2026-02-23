'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  useNotifications,
  type UseNotificationsReturn,
} from '@/hooks/useNotifications';
import { useNotificationPolling } from '@/hooks/use-notification-polling';

const NotificationContext = createContext<UseNotificationsReturn | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const notificationsHook = useNotifications({
    userId,
    limit: 50,
    autoFetch: Boolean(userId),
  });

  useNotificationPolling(notificationsHook, {
    interval: 30000,
    enabled: Boolean(userId),
  });

  const value = useMemo(() => notificationsHook, [notificationsHook]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCenter(): UseNotificationsReturn {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationCenter must be used within a NotificationProvider'
    );
  }
  return context;
}

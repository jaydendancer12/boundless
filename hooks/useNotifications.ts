import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { getNotifications } from '@/lib/api/notifications';
import { Notification } from '@/types/notifications';

interface UseNotificationsOptions {
  userId?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  error: Error | null;
  total: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => Promise<void>;
  markNotificationAsRead: (ids: string[]) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(
  input?: string | UseNotificationsOptions
): UseNotificationsReturn {
  const userId =
    typeof input === 'string' ? input : (input?.userId as string | undefined);
  const options = typeof input === 'object' ? input : {};
  const { page: initialPage = 1, limit = 10, autoFetch = true } = options;
  const shouldConnectSocket = Boolean(userId);

  const { socket, isConnected } = useSocket({
    namespace: '/notifications',
    userId,
    autoConnect: shouldConnectSocket,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(currentPage, limit);

      if (response && Array.isArray(response.notifications)) {
        const sorted = [...response.notifications].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);
        setTotal(response.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch notifications')
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [fetchNotifications, autoFetch]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      setError(null);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('get-unread-count');
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNotification = (notification: any) => {
      const normalizedNotification: Notification = {
        ...notification,
        id: notification.id || notification._id,
        createdAt:
          notification.createdAt ||
          notification.timestamp ||
          new Date().toISOString(),
      };

      setNotifications(prev => {
        const exists = prev.some(n => n.id === normalizedNotification.id);
        if (exists) {
          return prev;
        }

        if (currentPage === 1) {
          return [normalizedNotification, ...prev];
        }
        return prev;
      });
      setUnreadCount(prev => prev + 1);
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    const handleNotificationUpdated = (data: any) => {
      const id = data.notificationId || data.id || data._id;
      if (id) {
        setNotifications(prev =>
          prev.map(notif => (notif.id === id ? { ...notif, ...data } : notif))
        );
      }
    };

    const handleAllRead = () => {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    };

    const handleError = (error: { message: string }) => {
      console.error('WebSocket error:', error);
    };

    socket.on('notification', handleNotification);
    socket.on('unread-count', handleUnreadCount);
    socket.on('notification-updated', handleNotificationUpdated);
    socket.on('all-notifications-read', handleAllRead);
    socket.on('error', handleError);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('unread-count', handleUnreadCount);
      socket.off('notification-updated', handleNotificationUpdated);
      socket.off('all-notifications-read', handleAllRead);
      socket.off('error', handleError);
    };
  }, [socket, currentPage]);

  const markAsRead = (notificationId: string) => {
    const didChangeUnread = notifications.some(
      notification => notification.id === notificationId && !notification.read
    );
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notificationId) {
          return { ...n, read: true };
        }
        return n;
      })
    );
    if (didChangeUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (socket && isConnected) {
      socket.emit('mark-read', { notificationId });
    }
  };

  const markNotificationAsRead = async (ids: string[]) => {
    const unreadNotificationIds = new Set(
      notifications.filter(notification => !notification.read).map(n => n.id)
    );
    const changedUnreadCount = ids.filter(id =>
      unreadNotificationIds.has(id)
    ).length;

    setNotifications(prev =>
      prev.map(n => {
        if (ids.includes(n.id)) {
          return { ...n, read: true };
        }
        return n;
      })
    );
    if (changedUnreadCount > 0) {
      setUnreadCount(prev => Math.max(0, prev - changedUnreadCount));
    }

    if (socket && isConnected) {
      ids.forEach(id => socket.emit('mark-read', { notificationId: id }));
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    if (socket && isConnected) {
      socket.emit('mark-all-read');
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    total,
    currentPage,
    setCurrentPage,
    markAsRead,
    markAllAsRead,
    markNotificationAsRead,
    fetchNotifications,
    refetch: fetchNotifications,
  };
}

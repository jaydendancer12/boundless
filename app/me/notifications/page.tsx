'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { NotificationList } from '@/components/notifications/NotificationList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { useNotificationCenter } from '@/components/providers/notification-provider';
import type { Notification } from '@/types/notifications';

const formatMetadataValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export default function MeNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAllAsRead,
    markNotificationAsRead,
    refetch,
  } = useNotificationCenter();

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const metadataEntries = useMemo(() => {
    if (!selectedNotification) {
      return [];
    }

    return Object.entries(selectedNotification.data).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    );
  }, [selectedNotification]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleOpenDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setSheetOpen(true);

    if (!notification.read) {
      markNotificationAsRead([notification.id]).catch(() => {
        toast.error('Failed to update notification state');
      });
    }
  };

  if (error) {
    return (
      <div className='mx-auto w-full max-w-5xl p-6'>
        <div className='rounded-lg border border-red-800/50 bg-red-950/20 p-8 text-center'>
          <p className='text-lg font-semibold text-red-400'>
            Error loading notifications
          </p>
          <p className='mt-2 text-sm text-zinc-400'>{error.message}</p>
          <Button onClick={() => refetch()} className='mt-4' variant='outline'>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='mx-auto w-full max-w-5xl p-6'>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-white'>Notifications</h1>
            <div className='mt-1 text-sm text-zinc-400'>
              {loading ? (
                <Skeleton className='h-4 w-48' />
              ) : (
                <>
                  {unreadCount} unread of {notifications.length} loaded
                </>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {unreadCount > 0 && !loading && (
              <motion.div
                key='mark-all-button'
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleMarkAllAsRead}
                  variant='outline'
                  className='border-primary/30 text-primary hover:bg-primary/10'
                >
                  Mark all as read
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NotificationList
          notifications={notifications}
          loading={loading}
          onNotificationClick={handleOpenDetails}
        />
      </div>

      <BoundlessSheet
        open={sheetOpen}
        setOpen={setSheetOpen}
        title={selectedNotification?.title || 'Notification details'}
      >
        {selectedNotification ? (
          <div className='space-y-5 px-4 pb-8 md:px-8'>
            <div className='space-y-2'>
              <p className='text-sm leading-relaxed text-zinc-300'>
                {selectedNotification.message}
              </p>
              <p className='text-xs text-zinc-500'>
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
              <p className='text-xs font-medium text-zinc-400'>
                Type: {selectedNotification.type}
              </p>
            </div>

            <div className='space-y-2'>
              <h2 className='text-sm font-semibold text-zinc-200'>Metadata</h2>
              {metadataEntries.length === 0 ? (
                <p className='text-xs text-zinc-500'>
                  No additional metadata provided.
                </p>
              ) : (
                <dl className='space-y-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3'>
                  {metadataEntries.map(([key, value]) => (
                    <div key={key} className='grid grid-cols-3 gap-2 text-xs'>
                      <dt className='text-zinc-500'>{key}</dt>
                      <dd className='col-span-2 break-all text-zinc-300'>
                        {formatMetadataValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        ) : null}
      </BoundlessSheet>
    </>
  );
}

'use client';

import { isBefore, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
}

const ACTIVE_RETENTION_DAYS = 30;

const isArchivedNotification = (notification: Notification): boolean => {
  const archivedFlag = Boolean(
    notification.data.archivedBy ||
    notification.data['archived'] ||
    notification.data['isArchived']
  );

  if (archivedFlag) {
    return true;
  }

  const cutoffDate = subDays(new Date(), ACTIVE_RETENTION_DAYS);
  return isBefore(new Date(notification.createdAt), cutoffDate);
};

const groupNotifications = (notifications: Notification[]) => {
  const groups = {
    new: [] as Notification[],
    earlier: [] as Notification[],
    archived: [] as Notification[],
  };

  notifications.forEach(notification => {
    if (isArchivedNotification(notification)) {
      groups.archived.push(notification);
      return;
    }

    if (!notification.read) {
      groups.new.push(notification);
      return;
    }

    groups.earlier.push(notification);
  });

  return groups;
};

const SECTION_CONFIG = [
  {
    key: 'new',
    title: 'New',
    emptyTitle: 'No new notifications',
    emptyDescription: 'You are all caught up for now.',
  },
  {
    key: 'earlier',
    title: 'Earlier',
    emptyTitle: 'No earlier notifications',
    emptyDescription: 'Read notifications from this cycle will appear here.',
  },
  {
    key: 'archived',
    title: 'Archived',
    emptyTitle: 'No archived notifications',
    emptyDescription: 'Older or dismissed notifications will collect here.',
  },
] as const;

export const NotificationList = ({
  notifications,
  loading = false,
  onNotificationClick,
  onMarkAsRead,
}: NotificationListProps) => {
  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className='h-24 w-full rounded-lg' />
        ))}
      </div>
    );
  }

  const groupedNotifications = groupNotifications(notifications);

  return (
    <div className='space-y-8'>
      {SECTION_CONFIG.map(section => {
        const sectionItems = groupedNotifications[section.key];

        return (
          <section
            key={section.key}
            aria-labelledby={`notifications-${section.key}-heading`}
            className='space-y-3'
          >
            <div className='border-b border-white/10 pb-2'>
              <h2
                id={`notifications-${section.key}-heading`}
                className='text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase'
              >
                {section.title}
              </h2>
            </div>

            {sectionItems.length === 0 ? (
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/35 p-5'>
                <p className='text-sm font-medium text-zinc-300'>
                  {section.emptyTitle}
                </p>
                <p className='mt-1 text-xs text-zinc-500'>
                  {section.emptyDescription}
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <div className='space-y-2'>
                  {sectionItems.map(notification => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={() => {
                          if (onMarkAsRead) {
                            onMarkAsRead(notification.id);
                          }
                          if (onNotificationClick) {
                            onNotificationClick(notification);
                          }
                        }}
                        showUnreadIndicator={true}
                        disableNavigation={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </section>
        );
      })}
    </div>
  );
};

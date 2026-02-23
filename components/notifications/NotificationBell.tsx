'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { cn } from '@/lib/utils';
import { useNotificationCenter } from '@/components/providers/notification-provider';
import { authClient } from '@/lib/auth-client';

interface NotificationBellProps {
  className?: string;
  limit?: number;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAllAsRead,
    markNotificationAsRead,
  } = useNotificationCenter();

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
  };

  const handleNotificationClick = (
    notification: (typeof notifications)[number]
  ) => {
    if (!notification.read) {
      markNotificationAsRead([notification.id]).catch(() => {});
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-center rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white',
            className
          )}
          aria-label='Notifications'
          title={
            isConnected
              ? 'Notifications connected'
              : 'Notifications disconnected'
          }
        >
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <span className='bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {!isConnected && userId && (
            <span className='absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-zinc-900 bg-red-500' />
          )}
        </button>
      </DropdownMenuTrigger>
      <NotificationDropdown
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClose={() => setIsOpen(false)}
      />
    </DropdownMenu>
  );
};

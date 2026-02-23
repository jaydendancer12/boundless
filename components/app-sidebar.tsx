'use client';

import * as React from 'react';
import {
  IconBell,
  IconChartBar,
  IconDashboard,
  IconFileText,
  IconFolder,
  IconSettings,
  IconShieldCheck,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { useNotificationCenter } from '@/components/providers/notification-provider';

const navigationData = {
  main: [
    {
      title: 'Overview',
      url: '/me',
      icon: IconDashboard,
    },
    {
      title: 'Analytics',
      url: '/me/analytics',
      icon: IconChartBar,
    },
  ],
  projects: [
    {
      title: 'My Projects',
      url: '/me/projects',
      icon: IconFolder,
      badge: '3',
    },
    {
      title: 'Create Project',
      url: '/me/projects/create',
      icon: IconFileText,
    },
  ],
  hackathons: [
    {
      title: 'Participating',
      url: '/me/hackathons',
      icon: IconShieldCheck,
      badge: '2',
    },
    {
      title: 'Submissions',
      url: '/me/hackathons/submissions',
      icon: IconUsers,
    },
  ],
  crowdfunding: [
    {
      title: 'Campaigns',
      url: '/me/crowdfunding',
      icon: IconShieldCheck,
    },
  ],
  account: [
    {
      title: 'Profile',
      url: '/me/profile',
      icon: IconUserCircle,
    },
    {
      title: 'Settings',
      url: '/me/settings',
      icon: IconSettings,
    },
    {
      title: 'Notifications',
      url: '/me/notifications',
      icon: IconBell,
    },
  ],
};
interface userData {
  name: string;
  email: string;
  image: string;
}
export function AppSidebar({
  user,
  ...props
}: { user: userData } & React.ComponentProps<typeof Sidebar>) {
  const { unreadCount } = useNotificationCenter();
  const accountItems = navigationData.account.map(item =>
    item.title === 'Notifications'
      ? { ...item, badge: unreadCount > 0 ? String(unreadCount) : undefined }
      : item
  );

  return (
    <Sidebar collapsible='icon' {...props}>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute right-0 bottom-0 left-0 h-[300px] opacity-50'>
          <Image
            src='/wave.svg'
            alt='Background Pattern'
            width={300}
            height={300}
            className='h-full w-full object-cover'
          />
        </div>
      </div>

      <SidebarHeader className='border-sidebar-border/50 border-b'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              className='group hover:bg-sidebar-accent/0 transition-all duration-200'
            >
              <Link href='/dashboard' className='flex items-center gap-3'>
                <div className='flex items-center justify-center rounded-lg'>
                  <Image
                    width={24}
                    height={24}
                    className='h-auto w-4/5 object-contain'
                    src='/logo.svg'
                    alt='Boundless Logo'
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='gap-4 px-2 py-4'>
        <NavMain items={navigationData.main} />
        <NavMain items={navigationData.projects} label='Projects' />
        <NavMain items={navigationData.crowdfunding} label='Crowdfunding' />
        <NavMain items={navigationData.hackathons} label='Hackathons' />
        <NavMain items={accountItems} label='Account' />
      </SidebarContent>
      <SidebarFooter className='border-sidebar-border/50 border-t p-2 backdrop-blur-sm'>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

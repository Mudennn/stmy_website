'use client'

import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboardIcon,
  CalendarIcon,
  UsersIcon,
  BuildingIcon,
  FileTextIcon,
  BellIcon,
  SettingsIcon,
} from 'lucide-react'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    email?: string
    name?: string
    role?: 'super_admin' | 'admin' | 'editor'
  }
}

/**
 * AppSidebar component for dashboard navigation.
 * Displays CMS navigation items based on user role.
 * Super Admin and Admin can access Users management; Editors cannot.
 */
export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // CMS navigation items - all roles can access these
  const cmsItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon className="size-4" />,
    },
    {
      title: 'Events',
      url: '/dashboard/events',
      icon: <CalendarIcon className="size-4" />,
    },
    {
      title: 'Members',
      url: '/dashboard/members',
      icon: <UsersIcon className="size-4" />,
    },
    {
      title: 'Partners',
      url: '/dashboard/partners',
      icon: <BuildingIcon className="size-4" />,
    },
    {
      title: 'Content',
      url: '/dashboard/content',
      icon: <FileTextIcon className="size-4" />,
    },
    {
      title: 'Announcements',
      url: '/dashboard/announcements',
      icon: <BellIcon className="size-4" />,
    },
  ]

  // Users management - only for admin roles
  const adminItems = user?.role && ['super_admin', 'admin'].includes(user.role)
    ? [
        {
          title: 'Users',
          url: '/dashboard/users',
          icon: <UsersIcon className="size-4" />,
        },
      ]
    : []

  // Secondary navigation
  const secondaryItems = [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: <SettingsIcon className="size-4" />,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/dashboard">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm">
                  ST
                </div>
                <span className="text-base font-semibold">Superteam MY</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={cmsItems} />
        {adminItems.length > 0 && <NavMain items={adminItems} />}
        <NavSecondary items={secondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

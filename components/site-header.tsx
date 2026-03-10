'use client'

import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

/**
 * SiteHeader component for dashboard top navigation.
 * Shows page title based on current route.
 */
export function SiteHeader() {
  const pathname = usePathname()

  // Map routes to display titles
  const getTitleFromPath = (path: string) => {
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/dashboard/events')) return 'Events'
    if (path.startsWith('/dashboard/members')) return 'Members'
    if (path.startsWith('/dashboard/partners')) return 'Partners'
    if (path.startsWith('/dashboard/content')) return 'Content'
    if (path.startsWith('/dashboard/announcements')) return 'Announcements'
    if (path.startsWith('/dashboard/users')) return 'Users'
    if (path.startsWith('/dashboard/settings')) return 'Settings'
    return 'Dashboard'
  }

  const pageTitle = getTitleFromPath(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  )
}

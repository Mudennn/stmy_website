'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ResourceTable } from '@/components/cms'
import { createAnnouncementColumns } from './announcements-columns'
import type { Database } from '@/types/database'

type Announcement = Database['public']['Tables']['announcements']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface AnnouncementsTableProps {
  announcements: Announcement[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: UserRole
}

/**
 * Client-side wrapper for the announcements ResourceTable.
 */
export function AnnouncementsTable({
  announcements,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
}: AnnouncementsTableProps) {
  const router = useRouter()
  const columns = useMemo(() => createAnnouncementColumns(currentRole), [currentRole])

  return (
    <ResourceTable
      columns={columns}
      data={announcements}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      currentRole={currentRole}
      resourceName="Announcement"
      searchPlaceholder="Search announcements..."
      showCreateButton={['admin', 'super_admin'].includes(currentRole)}
      onCreateNew={() => router.push('/dashboard/announcements/new')}
      filters={[
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ]}
    />
  )
}

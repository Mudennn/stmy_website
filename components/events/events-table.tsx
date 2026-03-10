'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ResourceTable } from '@/components/cms'
import { createEventColumns } from './events-columns'
import type { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface EventsTableProps {
  events: Event[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: UserRole
}

/**
 * Client-side wrapper for the events ResourceTable.
 * Handles the onCreateNew callback with router navigation.
 */
export function EventsTable({
  events,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
}: EventsTableProps) {
  const router = useRouter()
  const columns = useMemo(() => createEventColumns(currentRole), [currentRole])

  return (
    <ResourceTable
      columns={columns}
      data={events}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      currentRole={currentRole}
      resourceName="Event"
      searchPlaceholder="Search events by title..."
      showCreateButton={true}
      onCreateNew={() => router.push('/dashboard/events/new')}
      filters={[
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
      ]}
    />
  )
}

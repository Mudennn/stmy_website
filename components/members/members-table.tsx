'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ResourceTable } from '@/components/cms'
import { createMemberColumns } from './members-columns'
import type { Database } from '@/types/database'

type Member = Database['public']['Tables']['members']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface MembersTableProps {
  members: Member[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: UserRole
}

/**
 * Client-side wrapper for the members ResourceTable.
 */
export function MembersTable({
  members,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
}: MembersTableProps) {
  const router = useRouter()
  const columns = useMemo(() => createMemberColumns(currentRole), [currentRole])

  return (
    <ResourceTable
      columns={columns}
      data={members}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      currentRole={currentRole}
      resourceName="Member"
      searchPlaceholder="Search members by name..."
      showCreateButton={['admin', 'super_admin'].includes(currentRole)}
      onCreateNew={() => router.push('/dashboard/members/new')}
      filters={[
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ]}
    />
  )
}

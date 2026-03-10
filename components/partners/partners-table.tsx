'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ResourceTable } from '@/components/cms'
import { createPartnerColumns } from './partners-columns'
import type { Database } from '@/types/database'

type Partner = Database['public']['Tables']['partners']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface PartnersTableProps {
  partners: Partner[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: UserRole
}

/**
 * Client-side wrapper for the partners ResourceTable.
 */
export function PartnersTable({
  partners,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
}: PartnersTableProps) {
  const router = useRouter()
  const columns = useMemo(() => createPartnerColumns(currentRole), [currentRole])

  return (
    <ResourceTable
      columns={columns}
      data={partners}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      currentRole={currentRole}
      resourceName="Partner"
      searchPlaceholder="Search partners by name..."
      showCreateButton={['admin', 'super_admin'].includes(currentRole)}
      onCreateNew={() => router.push('/dashboard/partners/new')}
      filters={[
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ]}
    />
  )
}

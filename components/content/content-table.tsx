'use client'

import { useMemo } from 'react'
import { ResourceTable } from '@/components/cms'
import { createContentColumns } from './content-columns'
import type { Database } from '@/types/database'

type CmsContent = Database['public']['Tables']['cms_content']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface ContentTableProps {
  contents: CmsContent[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: UserRole
}

/**
 * Client-side wrapper for the CMS content ResourceTable.
 * Content is pre-seeded — no create button shown.
 */
export function ContentTable({
  contents,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
}: ContentTableProps) {
  const columns = useMemo(() => createContentColumns(currentRole), [currentRole])

  return (
    <ResourceTable
      columns={columns}
      data={contents}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      currentRole={currentRole}
      resourceName="Content"
      searchPlaceholder="Search content..."
      showCreateButton={false}
      filters={[
        { label: 'Published', value: 'true' },
        { label: 'Draft', value: 'false' },
      ]}
    />
  )
}

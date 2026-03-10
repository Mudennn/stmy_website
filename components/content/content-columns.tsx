'use client'

import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVerticalIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type CmsContent = Database['public']['Tables']['cms_content']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

function ContentActionCell({
  content,
  currentRole,
}: {
  content: CmsContent
  currentRole: UserRole
}) {
  const canEdit = ['editor', 'admin', 'super_admin'].includes(currentRole)

  if (!canEdit) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVerticalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/content/${content.id}`}
            className="flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Column definitions for the CMS content table.
 * Content is edit-only — no delete action.
 */
export function createContentColumns(currentRole: UserRole): ColumnDef<CmsContent>[] {
  return [
    {
      accessorKey: 'section',
      header: 'Section',
      cell: ({ row }) => {
        const content = row.original
        const canEdit = ['editor', 'admin', 'super_admin'].includes(currentRole)
        const label = content.section.replace(/_/g, ' ')

        if (!canEdit) return <span className="capitalize">{label}</span>
        return (
          <Link
            href={`/dashboard/content/${content.id}`}
            className="text-blue-600 hover:underline dark:text-blue-400 capitalize"
          >
            {label}
          </Link>
        )
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => row.original.title ?? '-',
    },
    {
      accessorKey: 'sort_order',
      header: 'Order',
      cell: ({ row }) => row.original.sort_order ?? '-',
    },
    {
      accessorKey: 'is_published',
      header: 'Published',
      cell: ({ row }) =>
        row.original.is_published ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
            Published
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-0">
            Draft
          </Badge>
        ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => {
        const val = row.original.updated_at
        if (!val) return '-'
        return new Date(val).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ContentActionCell content={row.original} currentRole={currentRole} />
      ),
    },
  ]
}

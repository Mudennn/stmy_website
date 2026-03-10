'use client'

import { useState } from 'react'
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
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import { deleteAnnouncement } from '@/lib/actions/announcements'
import { DeleteDialog } from '@/components/cms'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Announcement = Database['public']['Tables']['announcements']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

function AnnouncementActionCell({
  announcement,
  currentRole,
}: {
  announcement: Announcement
  currentRole: UserRole
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAnnouncement(announcement.id)
      toast.success('Announcement deleted successfully')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete announcement'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const canEdit = ['editor', 'admin', 'super_admin'].includes(currentRole)
  const canDelete = ['admin', 'super_admin'].includes(currentRole)

  if (!canEdit && !canDelete) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVerticalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/announcements/${announcement.id}`}
                className="flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              onSelect={() => setIsConfirmOpen(true)}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete && (
        <DeleteDialog
          resourceName="this announcement"
          onConfirm={handleDelete}
          isLoading={isDeleting}
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
        />
      )}
    </>
  )
}

/**
 * Column definitions for the announcements table.
 */
export function createAnnouncementColumns(currentRole: UserRole): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        const announcement = row.original
        const canEdit = ['editor', 'admin', 'super_admin'].includes(currentRole)
        const truncated =
          announcement.message.length > 80
            ? announcement.message.slice(0, 80) + '...'
            : announcement.message
        if (!canEdit) return <span>{truncated}</span>
        return (
          <Link
            href={`/dashboard/announcements/${announcement.id}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {truncated}
          </Link>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
            Active
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-0">
            Inactive
          </Badge>
        ),
    },
    {
      accessorKey: 'starts_at',
      header: 'Starts',
      cell: ({ row }) => {
        const val = row.original.starts_at
        if (!val) return '-'
        return new Date(val).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
    },
    {
      accessorKey: 'ends_at',
      header: 'Ends',
      cell: ({ row }) => {
        const val = row.original.ends_at
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
        <AnnouncementActionCell announcement={row.original} currentRole={currentRole} />
      ),
    },
  ]
}

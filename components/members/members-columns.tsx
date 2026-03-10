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
import { deleteMember } from '@/lib/actions/members'
import { DeleteDialog } from '@/components/cms'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Member = Database['public']['Tables']['members']['Row']
type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

function MemberActionCell({ member, currentRole }: { member: Member; currentRole: UserRole }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMember(member.id)
      toast.success('Member deleted successfully')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete member'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const canEdit = ['editor', 'admin', 'super_admin'].includes(currentRole)
  const canDelete = ['admin', 'super_admin'].includes(currentRole)

  if (!canEdit && !canDelete) {
    return null
  }

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
              <Link href={`/dashboard/members/${member.id}`} className="flex items-center">
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
          resourceName={`"${member.full_name}"`}
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
 * Column definitions for the members table.
 */
export function createMemberColumns(currentRole: UserRole): ColumnDef<Member>[] {
  return [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => {
        const member = row.original
        const canEdit = ['editor', 'admin', 'super_admin'].includes(currentRole)
        if (!canEdit) return <span>{member.full_name}</span>
        return (
          <Link
            href={`/dashboard/members/${member.id}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {member.full_name}
          </Link>
        )
      },
    },
    {
      accessorKey: 'role_title',
      header: 'Role',
      cell: ({ row }) => row.original.role_title || '-',
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => row.original.company || '-',
    },
    {
      accessorKey: 'is_featured',
      header: 'Featured',
      cell: ({ row }) =>
        row.original.is_featured ? (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0">
            Featured
          </Badge>
        ) : (
          '-'
        ),
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <MemberActionCell member={row.original} currentRole={currentRole} />,
    },
  ]
}

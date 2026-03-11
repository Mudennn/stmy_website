/**
 * TanStack React Table column definitions for admin users.
 * Displays email, name, role, status, and actions.
 */

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database'
import { UserActionsMenu } from './user-actions-menu'

export type AdminUser = Database['public']['Tables']['admin_users']['Row']

export const createUserColumns = (
  currentRole: 'super_admin' | 'admin' | 'editor'
): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.original.email
      return <div className="font-medium">{email}</div>
    },
  },
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => row.original.full_name || '—',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role
      const roleColors: Record<string, string> = {
        super_admin: 'bg-red-100 text-red-800',
        admin: 'bg-blue-100 text-blue-800',
        editor: 'bg-gray-100 text-gray-800',
      }
      return <Badge className={roleColors[role]}>{role}</Badge>
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <UserActionsMenu user={row.original} currentRole={currentRole} />
    ),
  },
]

/**
 * Actions menu for user management.
 * Super Admins can update roles and deactivate any user.
 * Admins can only deactivate editors.
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from 'radix-ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Shield, Power } from 'lucide-react'
import { deactivateUser, reactivateUser } from '@/lib/actions/users'
import { toast } from 'sonner'
import { RoleUpdateDialog } from './role-update-dialog'
import type { AdminUser } from './users-columns'

interface UserActionsMenuProps {
  user: AdminUser
  currentRole: 'super_admin' | 'admin' | 'editor'
}

export function UserActionsMenu({ user, currentRole }: UserActionsMenuProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false)
  const [isRoleUpdateOpen, setIsRoleUpdateOpen] = React.useState(false)

  const canManageUser =
    currentRole === 'super_admin' ||
    (currentRole === 'admin' && user.role === 'editor')

  const canUpdateRole = currentRole === 'super_admin'

  const handleDeactivate = async () => {
    setIsLoading(true)
    try {
      const result = await deactivateUser(user.id)

      if (result.success) {
        toast.success('User deactivated successfully')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
      setIsDeactivateOpen(false)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      const result = await reactivateUser(user.id)

      if (result.success) {
        toast.success('User reactivated successfully')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!canManageUser && !canUpdateRole) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canUpdateRole && (
            <DropdownMenuItem onSelect={() => setIsRoleUpdateOpen(true)}>
              <Shield className="size-4 mr-2" />
              Update Role
            </DropdownMenuItem>
          )}

          {canManageUser && (
            <>
              {user.is_active ? (
                <DropdownMenuItem onSelect={() => setIsDeactivateOpen(true)}>
                  <Power className="size-4 mr-2" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={handleReactivate} disabled={isLoading}>
                  <Power className="size-4 mr-2" />
                  Reactivate
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Deactivate confirmation dialog using Radix Dialog */}
      <Dialog.Root open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg mx-4">
            <Dialog.Title className="text-lg font-semibold mb-2">
              Deactivate User
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-6">
              Are you sure you want to deactivate {user.email}? They will no longer be able to access the dashboard.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={isLoading}
              >
                {isLoading ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Role update dialog */}
      <RoleUpdateDialog
        user={user}
        open={isRoleUpdateOpen}
        onOpenChange={setIsRoleUpdateOpen}
      />
    </>
  )
}

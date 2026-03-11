/**
 * Dialog for updating a user's role (Super Admin only).
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from 'radix-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { updateUserRole } from '@/lib/actions/users'
import { toast } from 'sonner'
import type { AdminUser } from './users-columns'

interface RoleUpdateDialogProps {
  user: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleUpdateDialog({
  user,
  open,
  onOpenChange,
}: RoleUpdateDialogProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = React.useState<'super_admin' | 'admin' | 'editor'>(
    user.role as 'super_admin' | 'admin' | 'editor'
  )
  const [isLoading, setIsLoading] = React.useState(false)

  const handleUpdate = async () => {
    if (selectedRole === user.role) {
      onOpenChange(false)
      return
    }

    setIsLoading(true)
    try {
      const result = await updateUserRole({
        userId: user.id,
        role: selectedRole,
      })

      if (result.success) {
        toast.success(`Role updated to ${selectedRole}`)
        router.refresh()
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg mx-4">
          <Dialog.Title className="text-lg font-semibold mb-2">
            Update User Role
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            Change the role for {user.email}
          </Dialog.Description>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={selectedRole} onValueChange={(value: 'super_admin' | 'admin' | 'editor') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

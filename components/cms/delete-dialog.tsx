'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'

interface DeleteDialogProps {
  resourceName: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Confirmation dialog for deleting a resource.
 * Renders a trash icon button by default, or a custom trigger.
 * Can be controlled via `open` and `onOpenChange` props, or uncontrolled with internal state.
 * Uses Radix Dialog for Escape-to-close, click-outside dismiss, focus trapping, and aria attributes.
 */
export function DeleteDialog({
  resourceName,
  onConfirm,
  isLoading = false,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: DeleteDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const dialogOpen = isControlled ? controlledOpen : internalOpen

  const setDialogOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } finally {
      setDialogOpen(false)
    }
  }

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <Dialog.Trigger asChild>
          {trigger ?? (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              disabled={isLoading}
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Delete {resourceName}</span>
            </Button>
          )}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg mx-4">
          <Dialog.Title className="text-lg font-semibold mb-2">
            Delete {resourceName}?
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            This action cannot be undone. The {resourceName} will be permanently deleted.
          </Dialog.Description>
          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

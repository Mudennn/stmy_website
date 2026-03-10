'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'

interface DeleteDialogProps {
  resourceName: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode
}

/**
 * Confirmation dialog for deleting a resource.
 * Renders a trash icon button by default, or a custom trigger.
 */
export function DeleteDialog({
  resourceName,
  onConfirm,
  isLoading = false,
  trigger,
}: DeleteDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
  }

  if (!open) {
    return (
      <>
        {trigger ? (
          <div onClick={() => setOpen(true)}>
            {trigger}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            disabled={isLoading}
            onClick={() => setOpen(true)}
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete {resourceName}</span>
          </Button>
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <h2 className="text-lg font-semibold mb-2">Delete {resourceName}?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This action cannot be undone. The {resourceName} will be permanently deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

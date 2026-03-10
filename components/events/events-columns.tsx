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
import { EllipsisVerticalIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { deleteEvent } from '@/lib/actions/events'
import { DeleteDialog } from '@/components/cms'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']

/**
 * Action cell component for event rows.
 * Handles edit and delete actions.
 */
function EventActionCell({ event }: { event: Event }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEvent(event.id)
      toast.success('Event deleted successfully')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete event'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

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
          <Link href={`/dashboard/events/${event.id}`} className="flex items-center">
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteDialog
            resourceName={`"${event.title}"`}
            onConfirm={handleDelete}
            isLoading={isDeleting}
            trigger={<span>Delete</span>}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

/**
 * Column definitions for the events table.
 * Used by TanStack React Table for rendering the table structure.
 */
export const eventColumns: ColumnDef<Event>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const event = row.original
      return (
        <Link
          href={`/dashboard/events/${event.id}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {event.title}
        </Link>
      )
    },
  },
  {
    accessorKey: 'event_date',
    header: 'Event Date',
    cell: ({ row }) => {
      const event = row.original
      if (!event.event_date) return '-'
      return new Date(event.event_date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => row.original.location || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const event = row.original
      const color =
        statusColors[event.status as keyof typeof statusColors] || ''
      return (
        <Badge className={`${color} border-0`}>
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => row.original.capacity || '-',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <EventActionCell event={row.original} />,
  },
]

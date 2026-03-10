import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getEvent } from '@/lib/actions/events'
import { FormShell } from '@/components/cms'
import { EventForm } from '@/components/events/event-form'

interface EventPageProps {
  params: Promise<{ id: string }>
}

/**
 * Edit event page.
 * Requires editor or admin role to access.
 * Fetches event data and renders the form in edit mode.
 */
export default async function EventPage({ params }: EventPageProps) {
  const session = await getSession()
  const { role } = session.adminUser

  // Only editors and admins can edit events
  if (!['editor', 'admin', 'super_admin'].includes(role)) {
    notFound()
  }

  const { id } = await params

  let event
  try {
    event = await getEvent(id)
  } catch {
    notFound()
  }

  return (
    <FormShell
      title="Edit Event"
      description="Update event details and settings"
      backHref="/dashboard/events"
    >
      <EventForm event={event} isEditMode={true} />
    </FormShell>
  )
}

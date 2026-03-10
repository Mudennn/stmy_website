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
 * Fetches event data and renders the form in edit mode.
 */
export default async function EventPage({ params }: EventPageProps) {
  const session = await getSession()
  const { id } = await params

  try {
    const event = await getEvent(id)

    return (
      <FormShell
        title="Edit Event"
        description="Update event details and settings"
        backHref="/dashboard/events"
      >
        <EventForm event={event} isEditMode={true} />
      </FormShell>
    )
  } catch (error) {
    notFound()
  }
}

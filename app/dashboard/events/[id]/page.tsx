import { notFound } from 'next/navigation'
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

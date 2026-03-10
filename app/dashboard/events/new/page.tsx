import { requireAdmin } from '@/lib/auth/session'
import { FormShell } from '@/components/cms'
import { EventForm } from '@/components/events/event-form'

/**
 * Create new event page.
 * Only admins can create events.
 */
export default async function NewEventPage() {
  await requireAdmin()

  return (
    <FormShell
      title="Create Event"
      description="Add a new event to the calendar"
      backHref="/dashboard/events"
    >
      <EventForm />
    </FormShell>
  )
}

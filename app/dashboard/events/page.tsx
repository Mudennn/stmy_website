import { getSession } from '@/lib/auth/session'
import { getEvents } from '@/lib/actions/events'
import { EventsTable } from '@/components/events/events-table'

interface EventsPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string; filter?: string }>
}

/**
 * Events list page with server-side rendering.
 * Fetches events based on search params and renders with ResourceTable.
 */
export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await getSession()
  const params = await searchParams

  const page = params.page ? parseInt(params.page) : 1
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 10
  const search = params.search
  const status = params.filter as 'draft' | 'published' | 'cancelled' | 'completed' | undefined

  // Fetch events from database
  const { events, totalCount } = await getEvents({
    page,
    pageSize,
    search,
    status,
  })

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Manage Superteam Malaysia events and conferences
        </p>
      </div>

      <EventsTable
        events={events}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentRole={session.adminUser.role}
      />
    </div>
  )
}

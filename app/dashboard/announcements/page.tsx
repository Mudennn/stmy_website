import { getSession } from '@/lib/auth/session'
import { getAnnouncements } from '@/lib/actions/announcements'
import { AnnouncementsTable } from '@/components/announcements/announcements-table'

interface AnnouncementsPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string; filter?: string; search?: string }>
}

/**
 * Announcements list page with server-side rendering.
 */
export default async function AnnouncementsPage({ searchParams }: AnnouncementsPageProps) {
  const session = await getSession()
  const params = await searchParams

  const rawPage = Number(params.page)
  const rawPageSize = Number(params.pageSize)

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10

  const validIsActive = ['true', 'false'] as const
  const isActive = validIsActive.includes(params.filter as (typeof validIsActive)[number])
    ? (params.filter as 'true' | 'false')
    : undefined

  const search = params.search?.trim() || undefined

  const { announcements, totalCount } = await getAnnouncements({ page, pageSize, isActive, search })

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">
          Manage site-wide announcement banners
        </p>
      </div>

      <AnnouncementsTable
        announcements={announcements}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentRole={session.adminUser.role}
      />
    </div>
  )
}

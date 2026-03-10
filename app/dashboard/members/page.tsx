import { getSession } from '@/lib/auth/session'
import { getMembers } from '@/lib/actions/members'
import { MembersTable } from '@/components/members/members-table'

interface MembersPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string; filter?: string }>
}

/**
 * Members list page with server-side rendering.
 */
export default async function MembersPage({ searchParams }: MembersPageProps) {
  const session = await getSession()
  const params = await searchParams

  const rawPage = Number(params.page)
  const rawPageSize = Number(params.pageSize)

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10
  const search = params.search

  const validIsActive = ['true', 'false'] as const
  const isActive = validIsActive.includes(params.filter as (typeof validIsActive)[number])
    ? (params.filter as 'true' | 'false')
    : undefined

  const { members, totalCount } = await getMembers({ page, pageSize, search, isActive })

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground">Manage Superteam Malaysia community members</p>
      </div>

      <MembersTable
        members={members}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentRole={session.adminUser.role}
      />
    </div>
  )
}

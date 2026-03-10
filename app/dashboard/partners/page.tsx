import { getSession } from '@/lib/auth/session'
import { getPartners } from '@/lib/actions/partners'
import { PartnersTable } from '@/components/partners/partners-table'

interface PartnersPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string; filter?: string }>
}

/**
 * Partners list page with server-side rendering.
 */
export default async function PartnersPage({ searchParams }: PartnersPageProps) {
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

  const { partners, totalCount } = await getPartners({ page, pageSize, search, isActive })

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
        <p className="text-muted-foreground">Manage Superteam Malaysia ecosystem partners</p>
      </div>

      <PartnersTable
        partners={partners}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentRole={session.adminUser.role}
      />
    </div>
  )
}

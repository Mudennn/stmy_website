import { getSession } from '@/lib/auth/session'
import { getContents } from '@/lib/actions/content'
import { ContentTable } from '@/components/content/content-table'

interface ContentPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string; filter?: string; section?: string }>
}

/**
 * CMS content list page with server-side rendering.
 */
export default async function ContentPage({ searchParams }: ContentPageProps) {
  const session = await getSession()
  const params = await searchParams

  const rawPage = Number(params.page)
  const rawPageSize = Number(params.pageSize)

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10

  const validIsPublished = ['true', 'false'] as const
  const isPublished = validIsPublished.includes(params.filter as (typeof validIsPublished)[number])
    ? (params.filter as 'true' | 'false')
    : undefined

  const { contents, totalCount } = await getContents({ page, pageSize, isPublished })

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CMS Content</h1>
        <p className="text-muted-foreground">
          Manage site section content
        </p>
      </div>

      <ContentTable
        contents={contents}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentRole={session.adminUser.role}
      />
    </div>
  )
}

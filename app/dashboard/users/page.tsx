/**
 * Users management page - displays list of admin users.
 * Only accessible to Super Admins and Admins.
 */

import { requireAdmin } from '@/lib/auth/session'
import { getUsers } from '@/lib/actions/users'
import { UsersTable } from '@/components/users/users-table'

interface UsersPageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
  }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // Require admin access
  const session = await requireAdmin()

  const params = await searchParams

  // Validate and coerce pagination
  const rawPage = Number(params.page)
  const rawPageSize = Number(params.pageSize)

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0 && rawPageSize <= 100
      ? rawPageSize
      : 10

  // Trim and normalize search
  const search = params.search?.trim() || undefined

  // Fetch users with validated params
  const { users, totalCount } = await getUsers({
    page,
    pageSize,
    search,
  })

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage admin users and permissions</p>
      </div>

      <UsersTable
        users={users}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        currentRole={session.adminUser.role}
      />
    </div>
  )
}

/**
 * Users table component for listing and managing admin users.
 * Displays users with search, pagination, and action buttons.
 */

'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createUserColumns, type AdminUser } from './users-columns'
import { Plus } from 'lucide-react'

interface UsersTableProps {
  users: AdminUser[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: 'super_admin' | 'admin' | 'editor'
}

export function UsersTable({
  users,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
}: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '')

  const handleSearchChange = (value: string) => {
    setSearchValue(value)

    const params = new URLSearchParams(searchParams)
    if (value.trim()) {
      params.set('search', value.trim())
      params.set('page', '1')
    } else {
      params.delete('search')
      params.delete('page')
    }

    router.push(`?${params.toString()}`)
  }

  const columns = React.useMemo(() => createUserColumns(currentRole), [currentRole])

  const [columnFilters] = React.useState<ColumnFiltersState>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
    },
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const params = new URLSearchParams(searchParams)
      params.set('page', String(currentPage + 1))
      router.push(`?${params.toString()}`)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const params = new URLSearchParams(searchParams)
      params.set('page', String(currentPage - 1))
      router.push(`?${params.toString()}`)
    }
  }

  const canInvite = currentRole === 'super_admin' || currentRole === 'admin'

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-4 justify-between items-center">
        <Input
          placeholder="Search by email or name..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        {canInvite && (
          <Button onClick={() => router.push('/dashboard/users/invite')}>
            <Plus className="size-4 mr-2" />
            Invite User
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2 py-1">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || totalCount === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Columns3Icon, ChevronDownIcon } from 'lucide-react'
import { TableToolbar } from './table-toolbar'
import { TablePagination } from './table-pagination'
import { RoleGate } from './role-gate'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface ResourceTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentRole: UserRole
  resourceName?: string
  onSearchChange?: (search: string) => void
  onFilterChange?: (filter: string) => void
  onCreateNew?: () => void
  showCreateButton?: boolean
  filters?: {
    label: string
    value: string
  }[]
  searchPlaceholder?: string
}

/**
 * Generic reusable table component for CMS resources.
 * Wraps TanStack React Table with toolbar, pagination, and role-based controls.
 * Handles column visibility, sorting, and filtering on the client.
 * Server-side pagination via URL search params.
 */
export function ResourceTable<TData, TValue>({
  columns,
  data,
  totalCount,
  currentPage,
  pageSize,
  currentRole,
  resourceName = 'Resource',
  onSearchChange,
  onFilterChange,
  onCreateNew,
  showCreateButton = true,
  filters,
  searchPlaceholder = 'Search...',
}: ResourceTableProps<TData, TValue>) {
  'use no memo'
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <RoleGate
        currentRole={currentRole}
        allowedRoles={['super_admin', 'admin']}
        fallback={
          showCreateButton ? (
            <div className="flex gap-2 items-center">
              <input
                placeholder={searchPlaceholder}
                className="h-9 px-3 py-2 flex-1 min-w-48 rounded-md border border-input bg-background text-sm"
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          ) : null
        }
      >
        <div className="flex gap-2 items-center justify-between flex-wrap">
          <TableToolbar
            searchPlaceholder={searchPlaceholder}
            onSearchChange={onSearchChange}
            onFilterChange={onFilterChange}
            onCreateNew={onCreateNew}
            filters={filters}
            showCreate={showCreateButton}
            createLabel={`Create ${resourceName}`}
          />

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon className="h-4 w-4 mr-2" />
                Columns
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </RoleGate>

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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={undefined}
        onPageSizeChange={undefined}
      />
    </div>
  )
}

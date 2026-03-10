'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'

interface TablePaginationProps {
  currentPage: number
  pageSize: number
  totalCount: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

/**
 * Pagination controls that update URL search params.
 * Server-side pagination via page and pageSize URL params.
 */
export function TablePagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
    onPageChange?.(page)
  }

  const updatePageSize = (size: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('pageSize', size.toString())
    params.delete('page') // Reset to page 1 on page size change
    router.push(`?${params.toString()}`)
    onPageSizeChange?.(size)
  }

  return (
    <div className="flex items-center justify-between gap-6 px-4 py-4 border-t">
      {/* Page size selector */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        <Select value={pageSize.toString()} onValueChange={(v) => updatePageSize(Number(v))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Page info */}
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} ({totalCount} total)
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex"
          onClick={() => updatePage(1)}
          disabled={!canPreviousPage}
        >
          <ChevronsLeftIcon className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(currentPage - 1)}
          disabled={!canPreviousPage}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(currentPage + 1)}
          disabled={!canNextPage}
        >
          <ChevronRightIcon className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex"
          onClick={() => updatePage(totalPages)}
          disabled={!canNextPage}
        >
          <ChevronsRightIcon className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusIcon, SearchIcon } from 'lucide-react'

interface TableToolbarProps {
  onSearchChange?: (search: string) => void
  onFilterChange?: (filter: string) => void
  onCreateNew?: () => void
  filters?: {
    label: string
    value: string
  }[]
  showCreate?: boolean
  createLabel?: string
  searchPlaceholder?: string
}

/**
 * Toolbar for resource tables with search, filter, and create button.
 * Updates URL search params for server-side pagination.
 */
export function TableToolbar({
  onSearchChange,
  onFilterChange,
  onCreateNew,
  filters,
  showCreate = true,
  createLabel = 'Create',
  searchPlaceholder = 'Search...',
}: TableToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get('search') ?? '')
  const filterValue = searchParams.get('filter') ?? 'all'
  const searchTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const handleSearchChange = (value: string) => {
    setSearch(value)

    // Debounce URL updates
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.delete('page') // Reset to page 1 on search
      router.push(`?${params.toString()}`)
      onSearchChange?.(value)
    }, 300)
  }

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    // 'all' value clears the filter
    if (value && value !== 'all') {
      params.set('filter', value)
    } else {
      params.delete('filter')
    }
    params.delete('page') // Reset to page 1 on filter
    router.push(`?${params.toString()}`)
    onFilterChange?.(value === 'all' ? '' : value)
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-48">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Dropdown */}
      {filters && filters.length > 0 && (
        <Select value={filterValue} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Create Button */}
      {showCreate && (
        <Button onClick={onCreateNew} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          {createLabel}
        </Button>
      )}
    </div>
  )
}

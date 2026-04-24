'use client'

import { useShops } from '../hooks/useShops'
import { useShopsFilters } from '../hooks/useShopsFilters'
import ShopsView from '@/modules/shops/components/ShopsView'

export default function ShopsPage() {
  const { search, page, openDay, handleSearchChange, handleOpenDayChange, clearFilters, setPage } = useShopsFilters()

  const { data, isLoading } = useShops({
    page,
    limit: 9,
    search: search || undefined,
    openDay: openDay || undefined,
  })

  return (
    <ShopsView
      shops={data?.shops ?? []}
      isLoading={isLoading}
      search={search}
      onSearchChange={handleSearchChange}
      openDay={openDay}
      onOpenDayChange={handleOpenDayChange}
      onClearFilters={clearFilters}
      pagination={data?.pagination}
      page={page}
      onPageChange={setPage}
    />
  )
}

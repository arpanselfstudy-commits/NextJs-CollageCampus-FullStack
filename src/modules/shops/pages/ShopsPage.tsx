'use client'

import { useState } from 'react'
import { useShops } from '../hooks/useShops'
import ShopsView from '@/modules/shops/components/ShopsView'

export default function ShopsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [openDay, setOpenDay] = useState('')

  const { data, isLoading } = useShops({
    page,
    limit: 9,
    search: search || undefined,
    openDay: openDay || undefined,
  })

  const handleClearFilters = () => {
    setOpenDay('')
    setPage(1)
  }

  return (
    <ShopsView
      shops={data?.shops ?? []}
      isLoading={isLoading}
      search={search}
      onSearchChange={(v) => { setSearch(v); setPage(1) }}
      openDay={openDay}
      onOpenDayChange={(d) => { setOpenDay(d); setPage(1) }}
      onClearFilters={handleClearFilters}
      pagination={data?.pagination}
      page={page}
      onPageChange={setPage}
    />
  )
}

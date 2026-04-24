'use client'

import { useState } from 'react'

export function useShopsFilters() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [openDay, setOpenDay] = useState('')

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }
  const handleOpenDayChange = (d: string) => { setOpenDay(d); setPage(1) }

  const clearFilters = () => {
    setOpenDay('')
    setPage(1)
  }

  return {
    search, page, openDay,
    handleSearchChange, handleOpenDayChange,
    clearFilters, setPage,
  }
}

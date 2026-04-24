'use client'

import { useState } from 'react'
import type { ListedProductCategory, ListedProductCondition } from '../types'

export function useMarketplaceFilters() {
  const [tab, setTab] = useState<'listed' | 'requested'>('listed')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // Listed filters
  const [selectedCat, setSelectedCat] = useState<ListedProductCategory | ''>('')
  const [selectedCondition, setSelectedCondition] = useState<ListedProductCondition | ''>('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minYearUsed, setMinYearUsed] = useState<number | ''>('')
  const [maxYearUsed, setMaxYearUsed] = useState<number | ''>('')

  // Requested filters
  const [reqCat, setReqCat] = useState<ListedProductCategory | ''>('')
  const [isNegotiable, setIsNegotiable] = useState<string>('')
  const [isFulfilled, setIsFulfilled] = useState<string>('')
  const [reqMinPrice, setReqMinPrice] = useState<number | ''>('')
  const [reqMaxPrice, setReqMaxPrice] = useState<number | ''>('')

  const handleTabChange = (t: 'listed' | 'requested') => {
    setTab(t); setPage(1); setSearch('')
  }

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }

  const clearListedFilters = () => {
    setSelectedCat(''); setSelectedCondition('')
    setMinPrice(''); setMaxPrice('')
    setMinYearUsed(''); setMaxYearUsed('')
    setPage(1)
  }

  const clearRequestedFilters = () => {
    setReqCat(''); setIsNegotiable(''); setIsFulfilled('')
    setReqMinPrice(''); setReqMaxPrice('')
    setPage(1)
  }

  return {
    tab, page, search,
    selectedCat, selectedCondition, minPrice, maxPrice, minYearUsed, maxYearUsed,
    reqCat, isNegotiable, isFulfilled, reqMinPrice, reqMaxPrice,
    handleTabChange, handleSearchChange,
    setSelectedCat, setSelectedCondition,
    setMinPrice, setMaxPrice,
    setMinYearUsed, setMaxYearUsed,
    setReqCat, setIsNegotiable, setIsFulfilled,
    setReqMinPrice, setReqMaxPrice,
    clearListedFilters, clearRequestedFilters,
    setPage,
  }
}

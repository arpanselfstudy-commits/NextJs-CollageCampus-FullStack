'use client'

import { useState } from 'react'
import { useListedProducts } from '../hooks/useListedProducts'
import { useRequestedProducts } from '../hooks/useRequestedProducts'
import MarketplaceView from '@/modules/marketplace/components/MarketplaceView'
import type { ListedProductCategory, ListedProductCondition } from '../types'

export default function MarketplacePage() {
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

  const { data: listedData, isLoading: listedLoading } = useListedProducts({
    page, limit: 9,
    search: search || undefined,
    category: selectedCat || undefined,
    condition: selectedCondition || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minYearUsed: minYearUsed !== '' ? minYearUsed : undefined,
    maxYearUsed: maxYearUsed !== '' ? maxYearUsed : undefined,
  })

  const { data: requestedData, isLoading: requestedLoading } = useRequestedProducts({
    page, limit: 9,
    search: search || undefined,
    category: reqCat || undefined,
    isNegotiable: isNegotiable || undefined,
    isFulfilled: isFulfilled || undefined,
    minPrice: reqMinPrice !== '' ? reqMinPrice : undefined,
    maxPrice: reqMaxPrice !== '' ? reqMaxPrice : undefined,
  })

  const handleTabChange = (t: 'listed' | 'requested') => {
    setTab(t); setPage(1); setSearch('')
  }

  const handleClearListedFilters = () => {
    setSelectedCat(''); setSelectedCondition('')
    setMinPrice(''); setMaxPrice('')
    setMinYearUsed(''); setMaxYearUsed('')
    setPage(1)
  }

  const handleClearRequestedFilters = () => {
    setReqCat(''); setIsNegotiable(''); setIsFulfilled('')
    setReqMinPrice(''); setReqMaxPrice('')
    setPage(1)
  }

  return (
    <MarketplaceView
      tab={tab}
      onTabChange={handleTabChange}
      listed={listedData?.products ?? []}
      listedLoading={listedLoading}
      requested={requestedData?.products ?? []}
      requestedLoading={requestedLoading}
      search={search}
      onSearchChange={(v) => { setSearch(v); setPage(1) }}
      // Listed filters
      selectedCat={selectedCat}
      onCatChange={(c) => { setSelectedCat(c); setPage(1) }}
      selectedCondition={selectedCondition}
      onConditionChange={(c) => { setSelectedCondition(c); setPage(1) }}
      onClearCondition={() => setSelectedCondition('')}
      minPrice={minPrice}
      onMinPriceChange={(v) => { setMinPrice(v); setPage(1) }}
      maxPrice={maxPrice}
      onMaxPriceChange={(v) => { setMaxPrice(v); setPage(1) }}
      minYearUsed={minYearUsed}
      onMinYearUsedChange={(v) => { setMinYearUsed(v); setPage(1) }}
      maxYearUsed={maxYearUsed}
      onMaxYearUsedChange={(v) => { setMaxYearUsed(v); setPage(1) }}
      onClearListedFilters={handleClearListedFilters}
      // Requested filters
      reqCat={reqCat}
      onReqCatChange={(c) => { setReqCat(c); setPage(1) }}
      isNegotiable={isNegotiable}
      onIsNegotiableChange={(v) => { setIsNegotiable(v); setPage(1) }}
      isFulfilled={isFulfilled}
      onIsFulfilledChange={(v) => { setIsFulfilled(v); setPage(1) }}
      reqMinPrice={reqMinPrice}
      onReqMinPriceChange={(v) => { setReqMinPrice(v); setPage(1) }}
      reqMaxPrice={reqMaxPrice}
      onReqMaxPriceChange={(v) => { setReqMaxPrice(v); setPage(1) }}
      onClearRequestedFilters={handleClearRequestedFilters}
      // Pagination
      page={page}
      pagination={tab === 'listed' ? listedData?.pagination : requestedData?.pagination}
      onPageChange={setPage}
    />
  )
}

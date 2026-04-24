'use client'

import { useListedProducts } from '../hooks/useListedProducts'
import { useRequestedProducts } from '../hooks/useRequestedProducts'
import { useMarketplaceFilters } from '../hooks/useMarketplaceFilters'
import MarketplaceView from '@/modules/marketplace/components/MarketplaceView'

export default function MarketplacePage() {
  const {
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
  } = useMarketplaceFilters()

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

  return (
    <MarketplaceView
      tab={tab}
      onTabChange={handleTabChange}
      listed={listedData?.products ?? []}
      listedLoading={listedLoading}
      requested={requestedData?.products ?? []}
      requestedLoading={requestedLoading}
      search={search}
      onSearchChange={handleSearchChange}
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
      onClearListedFilters={clearListedFilters}
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
      onClearRequestedFilters={clearRequestedFilters}
      // Pagination
      page={page}
      pagination={tab === 'listed' ? listedData?.pagination : requestedData?.pagination}
      onPageChange={setPage}
    />
  )
}

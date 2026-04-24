'use client'

import '@/styles/design.css'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { MarketplaceSkeletonGrid } from '@/components/common/Loader/SkeletonCard'
import SearchInput from '@/components/common/Search/Search'
import Pagination from '@/components/common/Pagination/Pagination'
import { CATEGORY_LABEL, type ListedProductCategory, type ListedProductCondition } from '@/modules/marketplace/types'
import type { ListedProduct, RequestedProduct } from '@/modules/marketplace/types'
import ListedFilter from './ListedFilter'
import RequestedFilter from './RequestedFilter'
import ListedProductCard from './ListedProductCard'
import RequestedProductCard from './RequestedProductCard'
import styles from './MarketplaceView.module.css'

export interface MarketplaceViewProps {
  tab: 'listed' | 'requested'
  onTabChange: (t: 'listed' | 'requested') => void
  listed: ListedProduct[]
  listedLoading: boolean
  requested: RequestedProduct[]
  requestedLoading: boolean
  search: string
  onSearchChange: (v: string) => void
  // Listed filters
  selectedCat: ListedProductCategory | ''
  onCatChange: (c: ListedProductCategory | '') => void
  selectedCondition: ListedProductCondition | ''
  onConditionChange: (c: ListedProductCondition) => void
  onClearCondition: () => void
  minPrice: string
  onMinPriceChange: (v: string) => void
  maxPrice: string
  onMaxPriceChange: (v: string) => void
  minYearUsed: number | ''
  onMinYearUsedChange: (v: number | '') => void
  maxYearUsed: number | ''
  onMaxYearUsedChange: (v: number | '') => void
  onClearListedFilters: () => void
  // Requested filters
  reqCat: ListedProductCategory | ''
  onReqCatChange: (c: ListedProductCategory | '') => void
  isNegotiable: string
  onIsNegotiableChange: (v: string) => void
  isFulfilled: string
  onIsFulfilledChange: (v: string) => void
  reqMinPrice: number | ''
  onReqMinPriceChange: (v: number | '') => void
  reqMaxPrice: number | ''
  onReqMaxPriceChange: (v: number | '') => void
  onClearRequestedFilters: () => void
  // Pagination
  page: number
  pagination?: { total: number; page: number; limit: number; pages: number }
  onPageChange: (p: number) => void
}

export default function MarketplaceView({
  tab, onTabChange,
  listed, listedLoading, requested, requestedLoading,
  search, onSearchChange,
  selectedCat, onCatChange, selectedCondition, onConditionChange, onClearCondition,
  minPrice, onMinPriceChange, maxPrice, onMaxPriceChange,
  minYearUsed, onMinYearUsedChange, maxYearUsed, onMaxYearUsedChange,
  onClearListedFilters,
  reqCat, onReqCatChange, isNegotiable, onIsNegotiableChange,
  isFulfilled, onIsFulfilledChange,
  reqMinPrice, onReqMinPriceChange, reqMaxPrice, onReqMaxPriceChange,
  onClearRequestedFilters,
  page, pagination, onPageChange,
}: MarketplaceViewProps) {
  const isLoading = tab === 'listed' ? listedLoading : requestedLoading

  return (
    <div className="marketplace-page">
      <div className="marketplace-hero">
        <h1 className="marketplace-hero-title">Marketplace</h1>
        <div className={styles.searchWrap}>
          <SearchInput placeholder="Search products..." defaultValue={search} onSearch={onSearchChange} />
        </div>
        <div className="marketplace-tabs-row">
          <button onClick={() => onTabChange('listed')} className={`mp-tab${tab === 'listed' ? ' mp-tab--active' : ''}`}>Listed Items</button>
          <button onClick={() => onTabChange('requested')} className={`mp-tab${tab === 'requested' ? ' mp-tab--active' : ''}`}>Requested Items</button>
        </div>
      </div>

      <div className="marketplace-layout">
        <aside>
          {tab === 'listed' && (
            <ListedFilter
              selectedCat={selectedCat}
              onCatChange={onCatChange}
              selectedCondition={selectedCondition}
              onConditionChange={onConditionChange}
              onClearCondition={onClearCondition}
              minPrice={minPrice}
              onMinPriceChange={onMinPriceChange}
              maxPrice={maxPrice}
              onMaxPriceChange={onMaxPriceChange}
              minYearUsed={minYearUsed}
              onMinYearUsedChange={onMinYearUsedChange}
              maxYearUsed={maxYearUsed}
              onMaxYearUsedChange={onMaxYearUsedChange}
              onClearFilters={onClearListedFilters}
            />
          )}

          {tab === 'requested' && (
            <RequestedFilter
              reqCat={reqCat}
              onReqCatChange={onReqCatChange}
              isNegotiable={isNegotiable}
              onIsNegotiableChange={onIsNegotiableChange}
              isFulfilled={isFulfilled}
              onIsFulfilledChange={onIsFulfilledChange}
              reqMinPrice={reqMinPrice}
              onReqMinPriceChange={onReqMinPriceChange}
              reqMaxPrice={reqMaxPrice}
              onReqMaxPriceChange={onReqMaxPriceChange}
              onClearFilters={onClearRequestedFilters}
            />
          )}
        </aside>

        <div>
          {!isLoading && pagination && (
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>{pagination.total} item{pagination.total !== 1 ? 's' : ''} found</span>
            </div>
          )}

          {isLoading ? <MarketplaceSkeletonGrid count={9} /> : (
            <>
              {tab === 'listed' && (listed.length === 0 ? (
                <div className={styles.emptyState}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No listed products found.</p>
                  <button className={styles.clearFiltersBtn} onClick={onClearListedFilters}>Clear filters</button>
                </div>
              ) : (
                <div className="mp-grid">
                  {listed.map((item, i) => (
                    <ListedProductCard key={item._id ?? i} item={item} variant="main" />
                  ))}
                </div>
              ))}

              {tab === 'requested' && (requested.length === 0 ? (
                <div className={styles.emptyState}>
                  <MessageCircle size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No requested products found.</p>
                  <button className={styles.clearFiltersBtn} onClick={onClearRequestedFilters}>Clear filters</button>
                </div>
              ) : (
                <div className="mp-grid">
                  {requested.map((item, i) => (
                    <RequestedProductCard key={item._id ?? i} item={item} variant="main" />
                  ))}
                </div>
              ))}

              {pagination && (
                <Pagination page={page} pages={pagination.pages} onPageChange={onPageChange} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

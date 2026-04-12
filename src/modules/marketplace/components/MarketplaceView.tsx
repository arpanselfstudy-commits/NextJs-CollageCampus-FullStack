'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, MessageCircle, CheckCircle, FolderOpen, SlidersHorizontal, X, Tag } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { MarketplaceSkeletonGrid } from '@/components/common/Loader/SkeletonCard'
import SearchInput from '@/components/common/Search/Search'
import Pagination from '@/components/common/Pagination/Pagination'
import { CATEGORY_BG, CATEGORY_TEXT } from '@/utils/globalStaticData'
import { LISTED_CATEGORIES, LISTED_CONDITIONS, CATEGORY_LABEL, type ListedProductCategory, type ListedProductCondition } from '@/modules/marketplace/types'
import type { ListedProduct, RequestedProduct } from '@/modules/marketplace/types'
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
  const hasListedFilters = !!(selectedCat || selectedCondition || minPrice || maxPrice || minYearUsed !== '' || maxYearUsed !== '')
  const hasReqFilters = !!(reqCat || isNegotiable || isFulfilled || reqMinPrice !== '' || reqMaxPrice !== '')

  return (
    <div className="marketplace-page">
      <AppHeader />
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
          {/* Listed Filters */}
          {tab === 'listed' && (
            <>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}><SlidersHorizontal size={14} /> Filters</span>
                {hasListedFilters && (
                  <button className={styles.clearAll} onClick={onClearListedFilters}><X size={12} /> Clear all</button>
                )}
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-title"><FolderOpen size={15} /> Categories</div>
                {LISTED_CATEGORIES.map((c) => (
                  <label className={`mp-check${selectedCat === c ? ' mp-check--active' : ''}`} key={c}>
                    <input type="checkbox" checked={selectedCat === c} onChange={() => onCatChange(selectedCat === c ? '' : c)} />
                    {CATEGORY_LABEL[c]}
                  </label>
                ))}
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-section-title"><CheckCircle size={13} /> Condition</div>
                {LISTED_CONDITIONS.map((c) => (
                  <label className={`mp-check${selectedCondition === c ? ` ${styles.conditionActive}` : ''}`} key={c}>
                    <input type="radio" name="condition" checked={selectedCondition === c} onChange={() => onConditionChange(c)} />
                    {c === 'NEW' ? 'New' : c === 'USED' ? 'Used' : 'Refurbished'}
                  </label>
                ))}
                {selectedCondition && <button onClick={onClearCondition} className={styles.clearBtn}>Clear condition</button>}
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-section-title"><Tag size={13} /> Price Range</div>
                <div className={styles.rangeRow}>
                  <input type="number" min={0} placeholder="Min" value={minPrice} onChange={(e) => onMinPriceChange(e.target.value)} className={styles.rangeInput} />
                  <span className={styles.rangeSep}>–</span>
                  <input type="number" min={0} placeholder="Max" value={maxPrice} onChange={(e) => onMaxPriceChange(e.target.value)} className={styles.rangeInput} />
                </div>
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-section-title">Years Used</div>
                <div className={styles.rangeRow}>
                  <input type="number" min={0} placeholder="Min" value={minYearUsed} onChange={(e) => onMinYearUsedChange(e.target.value === '' ? '' : Number(e.target.value))} className={styles.rangeInput} />
                  <span className={styles.rangeSep}>–</span>
                  <input type="number" min={0} placeholder="Max" value={maxYearUsed} onChange={(e) => onMaxYearUsedChange(e.target.value === '' ? '' : Number(e.target.value))} className={styles.rangeInput} />
                </div>
              </div>
            </>
          )}

          {/* Requested Filters */}
          {tab === 'requested' && (
            <>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}><SlidersHorizontal size={14} /> Filters</span>
                {hasReqFilters && (
                  <button className={styles.clearAll} onClick={onClearRequestedFilters}><X size={12} /> Clear all</button>
                )}
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-title"><FolderOpen size={15} /> Categories</div>
                {LISTED_CATEGORIES.map((c) => (
                  <label className={`mp-check${reqCat === c ? ' mp-check--active' : ''}`} key={c}>
                    <input type="checkbox" checked={reqCat === c} onChange={() => onReqCatChange(reqCat === c ? '' : c)} />
                    {CATEGORY_LABEL[c]}
                  </label>
                ))}
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-section-title"><Tag size={13} /> Budget Range</div>
                <div className={styles.rangeRow}>
                  <input type="number" min={0} placeholder="Min" value={reqMinPrice} onChange={(e) => onReqMinPriceChange(e.target.value === '' ? '' : Number(e.target.value))} className={styles.rangeInput} />
                  <span className={styles.rangeSep}>–</span>
                  <input type="number" min={0} placeholder="Max" value={reqMaxPrice} onChange={(e) => onReqMaxPriceChange(e.target.value === '' ? '' : Number(e.target.value))} className={styles.rangeInput} />
                </div>
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-section-title">Negotiable</div>
                <div className={styles.toggleRow}>
                  {[{ label: 'Any', value: '' }, { label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }].map((opt) => (
                    <button key={opt.value} onClick={() => onIsNegotiableChange(opt.value)} className={`${styles.toggleBtn} ${isNegotiable === opt.value ? styles.toggleBtnActive : ''}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="mp-sidebar-section">
                <div className="mp-sidebar-section-title">Status</div>
                <div className={styles.toggleRow}>
                  {[{ label: 'Any', value: '' }, { label: 'Open', value: 'false' }, { label: 'Fulfilled', value: 'true' }].map((opt) => (
                    <button key={opt.value} onClick={() => onIsFulfilledChange(opt.value)} className={`${styles.toggleBtn} ${isFulfilled === opt.value ? styles.toggleBtnActive : ''}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </>
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
                  {hasListedFilters && <button className={styles.clearFiltersBtn} onClick={onClearListedFilters}>Clear filters</button>}
                </div>
              ) : (
                <div className="mp-grid">
                  {listed.map((item, i) => (
                    <Link href={`/marketplace/${item._id}`} key={item._id ?? i} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="mp-card">
                        <div className={`mp-card-img ${styles.mpCardImgWrap}`} style={{ background: CATEGORY_BG[item.category] ?? '#f0f4ff', position: 'relative' }}>
                          {item.images[0] ? <Image src={item.images[0]} alt={item.productName} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.mpCardImgCover} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" /> : <ShoppingBag size={56} color={CATEGORY_TEXT[item.category] ?? '#3730d4'} strokeWidth={1} />}
                          <span className="mp-card-price">${item.price}</span>
                        </div>
                        <div className="mp-card-body">
                          <div className="mp-card-category">
                            <span className={styles.catBadge} style={{ background: CATEGORY_BG[item.category] ?? '#e5e7eb', color: CATEGORY_TEXT[item.category] ?? '#374151' }}>{(CATEGORY_LABEL[item.category as ListedProductCategory] ?? item.category).toUpperCase()}</span>
                            <span className="mp-card-time">{item.condition}</span>
                          </div>
                          <div className="mp-card-title">{item.productName}</div>
                          <div className="mp-card-seller">
                            <div className="mp-seller-info">
                              <div className="mp-seller-avatar">{item.user?.[0]?.toUpperCase() ?? 'U'}</div>
                              <div><div className="mp-seller-name">{item.isNegotiable ? 'Negotiable' : 'Fixed price'}</div><div className="mp-seller-year">{item.yearUsed} yr{item.yearUsed !== 1 ? 's' : ''} used</div></div>
                            </div>
                            <button className="mp-msg-btn"><MessageCircle size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}

              {tab === 'requested' && (requested.length === 0 ? (
                <div className={styles.emptyState}>
                  <MessageCircle size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No requested products found.</p>
                  {hasReqFilters && <button className={styles.clearFiltersBtn} onClick={onClearRequestedFilters}>Clear filters</button>}
                </div>
              ) : (
                <div className="mp-grid">
                  {requested.map((item, i) => (
                    <Link href={`/marketplace/request/${item._id}`} key={item._id ?? i} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="mp-card">
                        <div className={`mp-card-img ${styles.mpCardImgWrap}`} style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' }}>
                          {item.images[0] ? <Image src={item.images[0]} alt={item.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.mpCardImgDim} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" /> : <MessageCircle size={56} color="white" strokeWidth={1} />}
                          <span className="mp-card-price">${item.price.from}–${item.price.to}</span>
                        </div>
                        <div className="mp-card-body">
                          <div className="mp-card-category">
                            <span className={styles.catBadge} style={{ background: '#fce7f3', color: '#9d174d' }}>{(CATEGORY_LABEL[item.category as ListedProductCategory] ?? item.category).toUpperCase()}</span>
                            {item.isFulfilled && <span className={styles.fulfilledBadge}>Fulfilled</span>}
                          </div>
                          <div className="mp-card-title">{item.name}</div>
                          <div className="mp-card-seller">
                            <div className="mp-seller-info">
                              <div className="mp-seller-avatar">{item.user?.[0]?.toUpperCase() ?? 'U'}</div>
                              <div><div className="mp-seller-name">{item.isNegotiable ? 'Negotiable' : 'Fixed'}</div></div>
                            </div>
                            <button className="mp-msg-btn"><MessageCircle size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </Link>
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
      <AppFooter />
    </div>
  )
}

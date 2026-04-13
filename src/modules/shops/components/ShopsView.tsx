'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import { SlidersHorizontal, X, Calendar } from 'lucide-react'
import { ShopsSkeletonGrid } from '@/components/common/Loader/SkeletonCard'
import SearchInput from '@/components/common/Search/Search'
import Pagination from '@/components/common/Pagination/Pagination'
import { DAYS_OF_WEEK } from '@/utils/globalStaticData'
import type { Shop } from '@/modules/shops/types'
import styles from './ShopsView.module.css'

export interface ShopsViewProps {
  shops: Shop[]
  isLoading: boolean
  search: string
  onSearchChange: (v: string) => void
  openDay: string
  onOpenDayChange: (d: string) => void
  onClearFilters: () => void
  pagination?: { total: number; page: number; limit: number; pages: number }
  page: number
  onPageChange: (p: number) => void
}

export default function ShopsView({
  shops, isLoading, search, onSearchChange,
  openDay, onOpenDayChange,
  onClearFilters,
  pagination, page, onPageChange,
}: ShopsViewProps) {
  const hasFilters = !!openDay

  return (
    <div className="shops-page">
      <div className="shops-hero">
        <h1 className="shops-hero-title">The Academic <em>Atelier.</em></h1>
        <p className="shops-hero-sub">Curated local favorites just steps from the university gates.</p>
        <div className={styles.searchWrap}>
          <SearchInput placeholder="Search shops, items..." defaultValue={search} onSearch={onSearchChange} />
        </div>
      </div>
      <div className="shops-layout">
        <aside className="shops-sidebar">
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}><SlidersHorizontal size={15} /> Filters</span>
            {hasFilters && (
              <button className={styles.clearAll} onClick={onClearFilters}>
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Open Day */}
          <div className={styles.filterSection}>
            <div className={styles.filterSectionTitle}><Calendar size={13} /> Open On</div>
            <div className={styles.dayGrid}>
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => onOpenDayChange(openDay === day ? '' : day)}
                  className={`${styles.dayBtn} ${openDay === day ? styles.dayBtnActive : ''}`}
                >
                  {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                </button>
              ))}
            </div>
          </div>

        </aside>

        <div className="shops-main">
          <div className="shops-main-header">
            <div className="shops-discover">Discover<span> Picks</span><em>.</em></div>
            <div className="shops-count">
              {isLoading ? 'Loading…' : pagination
                ? `${pagination.total} shop${pagination.total !== 1 ? 's' : ''} found`
                : `${shops.length} result${shops.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {isLoading ? <ShopsSkeletonGrid count={9} /> : shops.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No shops found. Try adjusting your filters.</p>
              {hasFilters && <button className={styles.clearFiltersBtn} onClick={onClearFilters}>Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="shops-grid">
                {shops.map((shop, i) => {
                  const id = shop._id ?? shop.shopId
                  const todayKey = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
                  const isOpenToday = shop.shopTiming?.[todayKey]?.isOpen
                  return (
                    <div className="shop-card" key={id ?? i}>
                      <div className="shop-card-img" style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' }}>
                        {(shop.photo || shop.photos?.[0]) && <Image src={shop.photo || shop.photos[0]} alt={shop.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.shopImgBg} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />}
                        <div className="shop-card-img-overlay" />
                        {!shop.photo && !shop.photos?.[0] && <span className={styles.shopEmoji}>🏪</span>}
                        <span style={{ position: 'absolute', top: 10, left: 10, background: isOpenToday ? '#dcfce7' : '#fef2f2', color: isOpenToday ? '#166534' : '#991b1b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {isOpenToday ? '● Open' : '● Closed'}
                        </span>
                      </div>
                      <div className="shop-card-body">
                        <div className="shop-card-header-row">
                          <div className="shop-card-name">{shop.name}</div>
                          <div className="shop-card-dist">{shop.distance}</div>
                        </div>
                        <div className="shop-card-desc">{shop.type}</div>
                        {shop.offers[0] && <div className="shop-card-deal">{shop.offers[0].offerName}</div>}
                        <div className="shop-card-actions">
                          <Link href={`/shops/${id}`} className="btn btn-primary">View Shop</Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
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

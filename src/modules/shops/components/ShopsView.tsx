'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import { Coffee, UtensilsCrossed, Wine, BookOpen, Star, Heart, FolderOpen, SlidersHorizontal, X, Calendar } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { SectionLoader } from '@/components/common/Loader/Loader'
import SearchInput from '@/components/common/Search/Search'
import Pagination from '@/components/common/Pagination/Pagination'
import { DAYS_OF_WEEK } from '@/utils/globalStaticData'
import type { Shop } from '@/modules/shops/types'
import styles from './ShopsView.module.css'

const ICON_MAP: Record<string, React.ElementType> = {
  cafe: Coffee, restaurant: UtensilsCrossed, bar: Wine, bookstore: BookOpen,
}

const DISTANCE_OPTIONS = ['500m', '1km', '2km', '3km', '5km', '10km']

export interface ShopsViewProps {
  shops: Shop[]
  isLoading: boolean
  search: string
  onSearchChange: (v: string) => void
  openDay: string
  onOpenDayChange: (d: string) => void
  distance: string
  onDistanceChange: (d: string) => void
  onClearFilters: () => void
  pagination?: { total: number; page: number; limit: number; pages: number }
  page: number
  onPageChange: (p: number) => void
}

export default function ShopsView({
  shops, isLoading, search, onSearchChange,
  openDay, onOpenDayChange,
  distance, onDistanceChange,
  onClearFilters,
  pagination, page, onPageChange,
}: ShopsViewProps) {
  const hasFilters = !!(openDay || distance)

  return (
    <div className="shops-page">
      <AppHeader />
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

          {/* Distance */}
          <div className={styles.filterSection}>
            <div className={styles.filterSectionTitle}><FolderOpen size={13} /> Distance</div>
            <div className={styles.distanceGrid}>
              {DISTANCE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => onDistanceChange(distance === d ? '' : d)}
                  className={`${styles.distanceBtn} ${distance === d ? styles.distanceBtnActive : ''}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="student-night-card">
            <div className="student-night-title">Student Night!</div>
            <div className="student-night-sub">Every Tuesday, 50% off all beverages at The Library Bar.</div>
            <button className="student-night-btn">Claim Spot</button>
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

          {isLoading ? <SectionLoader /> : shops.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No shops found. Try adjusting your filters.</p>
              {hasFilters && <button className={styles.clearFiltersBtn} onClick={onClearFilters}>Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="shops-grid">
                {shops.map((shop, i) => {
                  const id = shop._id ?? shop.shopId
                  return (
                    <div className="shop-card" key={id ?? i}>
                      <div className="shop-card-img" style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' }}>
                        {shop.photo && <Image src={shop.photo} alt={shop.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.shopImgBg} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />}
                        <div className="shop-card-img-overlay" />
                        {!shop.photo && <span className={styles.shopEmoji}>🏪</span>}
                        <div className="shop-card-rating"><Star size={11} style={{ display: 'inline', marginRight: 3 }} fill="#f59e0b" color="#f59e0b" />4.8</div>
                        <button className="shop-card-fav"><Heart size={14} /></button>
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
                          <button className="btn-fav"><Heart size={16} /></button>
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
      <AppFooter />
    </div>
  )
}

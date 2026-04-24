'use client'

import { FolderOpen, SlidersHorizontal, Tag, X } from 'lucide-react'
import { LISTED_CATEGORIES, CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import styles from './MarketplaceView.module.css'

export interface RequestedFilterProps {
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
  onClearFilters: () => void
}

const NEGOTIABLE_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
] as const

const STATUS_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Open', value: 'false' },
  { label: 'Fulfilled', value: 'true' },
] as const

export default function RequestedFilter({
  reqCat, onReqCatChange,
  isNegotiable, onIsNegotiableChange,
  isFulfilled, onIsFulfilledChange,
  reqMinPrice, onReqMinPriceChange,
  reqMaxPrice, onReqMaxPriceChange,
  onClearFilters,
}: RequestedFilterProps) {
  const hasFilters = !!(
    reqCat || isNegotiable || isFulfilled ||
    reqMinPrice !== '' || reqMaxPrice !== ''
  )

  return (
    <>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}><SlidersHorizontal size={14} /> Filters</span>
        {hasFilters && (
          <button className={styles.clearAll} onClick={onClearFilters}>
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-title"><FolderOpen size={15} /> Categories</div>
        {LISTED_CATEGORIES.map((c) => (
          <label className={`mp-check${reqCat === c ? ' mp-check--active' : ''}`} key={c}>
            <input
              type="checkbox"
              checked={reqCat === c}
              onChange={() => onReqCatChange(reqCat === c ? '' : c)}
            />
            {CATEGORY_LABEL[c]}
          </label>
        ))}
      </div>

      {/* Budget Range */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-section-title"><Tag size={13} /> Budget Range</div>
        <div className={styles.rangeRow}>
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={reqMinPrice}
            onChange={(e) => onReqMinPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.rangeSep}>–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={reqMaxPrice}
            onChange={(e) => onReqMaxPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>
      </div>

      {/* Negotiable */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-section-title">Negotiable</div>
        <div className={styles.toggleRow}>
          {NEGOTIABLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onIsNegotiableChange(opt.value)}
              className={`${styles.toggleBtn} ${isNegotiable === opt.value ? styles.toggleBtnActive : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-section-title">Status</div>
        <div className={styles.toggleRow}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onIsFulfilledChange(opt.value)}
              className={`${styles.toggleBtn} ${isFulfilled === opt.value ? styles.toggleBtnActive : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

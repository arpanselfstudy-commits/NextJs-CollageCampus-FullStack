'use client'

import { CheckCircle, FolderOpen, SlidersHorizontal, Tag, X } from 'lucide-react'
import { LISTED_CATEGORIES, LISTED_CONDITIONS, CATEGORY_LABEL, type ListedProductCategory, type ListedProductCondition } from '@/modules/marketplace/types'
import styles from './MarketplaceView.module.css'

export interface ListedFilterProps {
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
  onClearFilters: () => void
}

export default function ListedFilter({
  selectedCat, onCatChange,
  selectedCondition, onConditionChange, onClearCondition,
  minPrice, onMinPriceChange,
  maxPrice, onMaxPriceChange,
  minYearUsed, onMinYearUsedChange,
  maxYearUsed, onMaxYearUsedChange,
  onClearFilters,
}: ListedFilterProps) {
  const hasFilters = !!(
    selectedCat || selectedCondition ||
    minPrice || maxPrice ||
    minYearUsed !== '' || maxYearUsed !== ''
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
          <label className={`mp-check${selectedCat === c ? ' mp-check--active' : ''}`} key={c}>
            <input
              type="checkbox"
              checked={selectedCat === c}
              onChange={() => onCatChange(selectedCat === c ? '' : c)}
            />
            {CATEGORY_LABEL[c]}
          </label>
        ))}
      </div>

      {/* Condition */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-section-title"><CheckCircle size={13} /> Condition</div>
        {LISTED_CONDITIONS.map((c) => (
          <label className={`mp-check${selectedCondition === c ? ` ${styles.conditionActive}` : ''}`} key={c}>
            <input
              type="radio"
              name="condition"
              checked={selectedCondition === c}
              onChange={() => onConditionChange(c)}
            />
            {c === 'NEW' ? 'New' : c === 'USED' ? 'Used' : 'Refurbished'}
          </label>
        ))}
        {selectedCondition && (
          <button onClick={onClearCondition} className={styles.clearBtn}>Clear condition</button>
        )}
      </div>

      {/* Price Range */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-section-title"><Tag size={13} /> Price Range</div>
        <div className={styles.rangeRow}>
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className={styles.rangeInput}
          />
          <span className={styles.rangeSep}>–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className={styles.rangeInput}
          />
        </div>
      </div>

      {/* Years Used */}
      <div className="mp-sidebar-section">
        <div className="mp-sidebar-section-title">Years Used</div>
        <div className={styles.rangeRow}>
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minYearUsed}
            onChange={(e) => onMinYearUsedChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.rangeSep}>–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxYearUsed}
            onChange={(e) => onMaxYearUsedChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>
      </div>
    </>
  )
}

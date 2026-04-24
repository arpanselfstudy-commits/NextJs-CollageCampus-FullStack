'use client'

import { SlidersHorizontal, X, Calendar } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/utils/globalStaticData'
import styles from './ShopsView.module.css'

export interface ShopsFilterProps {
  openDay: string
  onOpenDayChange: (d: string) => void
  onClearFilters: () => void
}

export default function ShopsFilter({ openDay, onOpenDayChange, onClearFilters }: ShopsFilterProps) {
  const hasFilters = !!openDay

  return (
    <>
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
    </>
  )
}

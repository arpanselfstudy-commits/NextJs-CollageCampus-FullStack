'use client'

import { Clock } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/utils/globalStaticData'
import type { Shop } from '@/modules/shops/types'
import styles from './ShopDetailView.module.css'

interface ShopOpeningHoursProps {
  shopTiming: Shop['shopTiming']
}

export default function ShopOpeningHours({ shopTiming }: ShopOpeningHoursProps) {
  if (!shopTiming || Object.keys(shopTiming).length === 0) return null

  const todayKey = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Clock size={16} color="#3730d4" /> Opening Hours
      </h2>
      <div className={styles.hoursRow}>
        {DAYS_OF_WEEK.map((day) => {
          const t = shopTiming[day]
          if (!t) return null
          const isToday = day === todayKey
          return (
            <div
              key={day}
              className={`${styles.hourItem} ${isToday ? styles['hourItem--today'] : ''}`}
            >
              <span className={`${styles.hourDay} ${isToday ? styles['hourDay--today'] : ''}`}>
                {day}
              </span>
              <span className={`${styles.hourTime} ${!t.isOpen ? styles.hourClosed : ''}`}>
                {t.isOpen ? `${t.opensAt} – ${t.closesAt}` : 'Closed'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

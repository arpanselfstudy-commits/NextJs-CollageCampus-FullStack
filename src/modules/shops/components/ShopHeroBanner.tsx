'use client'

import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { MapPin } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/utils/globalStaticData'
import type { Shop } from '@/modules/shops/types'
import styles from './ShopDetailView.module.css'

interface ShopHeroBannerProps {
  shop: Shop
}

export default function ShopHeroBanner({ shop }: ShopHeroBannerProps) {
  const todayKey = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const isOpenToday = shop.shopTiming?.[todayKey]?.isOpen

  return (
    <div className={styles.heroBanner} style={{ position: 'relative' }}>
      <FallbackImage
        src={shop.photo || shop.photos?.[0]}
        alt={shop.name}
        fill
        sizes="100vw"
        className={styles.heroBannerBg}
        priority
      />
      <div className={styles.heroBannerOverlay} />
      <div className={styles.heroBannerContent}>
        <div className={styles.heroBadgeRow}>
          <span
            className={styles.heroBadge}
            style={{
              background: isOpenToday ? '#dcfce7' : '#fef2f2',
              color: isOpenToday ? '#166534' : '#991b1b',
            }}
          >
            {isOpenToday ? '● Open Now' : '● Closed'}
          </span>
          <span
            className={styles.heroBadge}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            {shop.type}
          </span>
        </div>
        <h1 className={styles.heroTitle}>{shop.name}</h1>
        <div className={styles.heroMeta}>
          <MapPin size={13} />
          {shop.location} • {shop.distance}
        </div>
      </div>
    </div>
  )
}

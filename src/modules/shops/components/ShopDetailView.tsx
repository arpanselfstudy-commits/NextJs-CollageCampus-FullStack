'use client'

import '@/styles/design.css'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton/BackButton'
import { Store as StoreIcon } from 'lucide-react'
import { PageLoader } from '@/components/common/Loader/Loader'
import type { Shop } from '@/modules/shops/types'
import styles from './ShopDetailView.module.css'
import ShopHeroBanner from './ShopHeroBanner'
import ShopTopItems from './ShopTopItems'
import ShopOpeningHours from './ShopOpeningHours'
import ShopContactCard from './ShopContactCard'

export interface ShopDetailViewProps {
  shop?: Shop
  isLoading: boolean
}

export default function ShopDetailView({ shop, isLoading }: ShopDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><PageLoader /></div>

  if (!shop) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundBody}>
        <StoreIcon size={48} color="#9ca3af" strokeWidth={1} />
        <p>Shop not found.</p>
        <Link href="/shops" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          <BackButton href="/shops" label="Back to Shops" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.backWrap}>
        <BackButton href="/shops" label="Back to Shops" />
      </div>

      <ShopHeroBanner shop={shop} />

      <div className={styles.body}>
        <div className={styles.main}>
          <ShopTopItems items={shop.topItems} />
          <ShopOpeningHours shopTiming={shop.shopTiming} />
        </div>

        <aside className={styles.sidebar}>
          <ShopContactCard
            email={shop.contactDetails.email}
            phoneNo={shop.contactDetails.phoneNo}
            location={shop.location}
          />
        </aside>
      </div>
    </div>
  )
}

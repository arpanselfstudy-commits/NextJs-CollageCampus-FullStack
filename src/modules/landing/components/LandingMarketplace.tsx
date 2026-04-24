'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { MarketplaceCardSkeleton } from '@/components/common/Loader/SkeletonCard'
import type { ListedProduct, RequestedProduct } from '@/modules/marketplace/types'
import ListedProductCard from '@/modules/marketplace/components/ListedProductCard'
import RequestedProductCard from '@/modules/marketplace/components/RequestedProductCard'
import styles from './landing.module.css'

interface LandingMarketplaceProps {
  listed: ListedProduct[]
  listedLoading: boolean
  requested: RequestedProduct[]
  requestedLoading: boolean
  tab: 'listed' | 'requested'
  onTabChange: (tab: 'listed' | 'requested') => void
}

export default function LandingMarketplace({
  listed, listedLoading, requested, requestedLoading, tab, onTabChange,
}: LandingMarketplaceProps) {
  return (
    <section className="landing-section">
      <div className="section-header">
        <h2 className="section-title">Marketplace</h2>
        <Link href="/marketplace" className="view-all">View All <ChevronRight size={14} /></Link>
      </div>

      {/* Tabs */}
      <div className={styles.mpTabsRow}>
        {(['listed', 'requested'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`${styles.mpTab} ${tab === t ? styles['mpTab--active'] : ''}`}
          >
            {t === 'listed' ? 'Listed by Users' : 'Requested by Users'}
          </button>
        ))}
      </div>

      {/* Listed */}
      {tab === 'listed' && (
        listedLoading ? (
          <div className={styles.mpGrid3}>
            {Array.from({ length: 6 }).map((_, i) => <MarketplaceCardSkeleton key={i} />)}
          </div>
        ) : listed.length === 0 ? (
          <p className={styles.emptyMsg}>No listed products yet.</p>
        ) : (
          <div className={styles.mpGrid3}>
            {listed.slice(0, 6).map((item) => (
              <ListedProductCard key={item._id} item={item} variant="compact" />
            ))}
          </div>
        )
      )}

      {/* Requested */}
      {tab === 'requested' && (
        requestedLoading ? (
          <div className={styles.mpGrid3}>
            {Array.from({ length: 6 }).map((_, i) => <MarketplaceCardSkeleton key={i} />)}
          </div>
        ) : requested.length === 0 ? (
          <p className={styles.emptyMsg}>No requests yet.</p>
        ) : (
          <div className={styles.mpGrid3}>
            {requested.slice(0, 6).map((item) => (
              <RequestedProductCard key={item._id} item={item} variant="compact" />
            ))}
          </div>
        )
      )}
    </section>
  )
}

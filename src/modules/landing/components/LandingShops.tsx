import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { ShopsSkeletonGrid } from '@/components/common/Loader/SkeletonCard'
import type { Shop } from '@/modules/shops/types'
import styles from './landing.module.css'

interface LandingShopsProps {
  shops: Shop[]
  isLoading: boolean
}

export default function LandingShops({ shops, isLoading }: LandingShopsProps) {
  return (
    <section className="landing-section">
      <div className="section-header">
        <h2 className="section-title">Local Curator&apos;s Picks</h2>
        <Link href="/shops" className="view-all">View All <ChevronRight size={14} /></Link>
      </div>

      {isLoading ? <ShopsSkeletonGrid count={4} /> : shops.length === 0 ? (
        <p className={styles.emptyMsg}>No shops available right now.</p>
      ) : (
        <div className={styles.shopsGrid}>
          {shops.slice(0, 4).map((shop, i) => (
            <div key={shop.shopId ?? i} className={styles.shopCard} style={{ position: 'relative' }}>
              {shop.photo && (
                <Image src={shop.photo} alt={shop.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.shopCardBg} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />
              )}
              <div className={styles.shopCardOverlay} />
              <div className={styles.shopCardContent}>
                {shop.offers[0] && (
                  <span className={styles.shopOfferBadge}>{shop.offers[0].offerName}</span>
                )}
                <div className={styles.shopName}>{shop.name}</div>
                <div className={styles.shopMeta}>{shop.type} • {shop.distance}</div>
                <Link href={`/shops/${shop._id ?? shop.shopId}`} className={styles.shopViewBtn}>
                  View Shop
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

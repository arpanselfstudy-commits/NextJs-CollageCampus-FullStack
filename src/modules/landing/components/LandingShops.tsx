import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Shop } from '@/modules/shops/types'
import ShopCard from '@/modules/shops/components/ShopCard'
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

      {isLoading ? (
        <div className={styles.shopsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.shopCard} style={{ background: '#e5e7eb' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <p className={styles.emptyMsg}>No shops available right now.</p>
      ) : (
        <div className={styles.shopsGrid}>
          {shops.slice(0, 6).map((shop, i) => (
            <ShopCard key={shop.shopId ?? shop._id ?? i} shop={shop} variant="compact" />
          ))}
        </div>
      )}
    </section>
  )
}

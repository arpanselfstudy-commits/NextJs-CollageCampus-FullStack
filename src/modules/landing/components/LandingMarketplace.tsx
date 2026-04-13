import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Tag, MessageCircle, ChevronRight } from 'lucide-react'
import { MarketplaceCardSkeleton } from '@/components/common/Loader/SkeletonCard'
import type { ListedProduct, RequestedProduct } from '@/modules/marketplace/types'
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
              <Link href={`/marketplace/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="mp-card">
                  <div className={`mp-card-img ${styles.mpCardImg}`} style={{ background: '#f0f4ff', position: 'relative' }}>
                    {item.images[0]
                      ? <Image src={item.images[0]} alt={item.productName} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.mpCardImgCover} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />
                      : <ShoppingBag size={56} color="#3730d4" strokeWidth={1} />
                    }
                    <span className="mp-card-price">${item.price}</span>
                  </div>
                  <div className="mp-card-body">
                    <div className="mp-card-category">
                      <span className={styles.catBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>
                        {item.category.toUpperCase()}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>{item.condition}</span>
                    </div>
                    <div className="mp-card-title">{item.productName}</div>
                    <div className="mp-card-seller">
                      <div className={styles.mpNegotiable}>
                        <Tag size={12} />{item.isNegotiable ? 'Negotiable' : 'Fixed price'}
                      </div>
                      <button className="mp-msg-btn"><MessageCircle size={14} /></button>
                    </div>
                  </div>
                </div>
              </Link>
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
              <div key={item._id} className="mp-card">
                <div className={`mp-card-img ${styles.mpCardImg}`} style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' }}>
                  {item.images[0]
                    ? <Image src={item.images[0]} alt={item.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.mpCardImgCoverDim} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />
                    : <MessageCircle size={56} color="white" strokeWidth={1} />
                  }
                  <span className="mp-card-price">${item.price.from}–${item.price.to}</span>
                </div>
                <div className="mp-card-body">
                  <div className="mp-card-category">
                    <span className={styles.catBadge} style={{ background: '#fce7f3', color: '#9d174d' }}>
                      {(item.category || 'REQUEST').toUpperCase()}
                    </span>
                    {item.isFulfilled && <span className={styles.catBadgeFulfilled}>Fulfilled</span>}
                  </div>
                  <div className="mp-card-title">{item.name}</div>
                  <div className="mp-card-seller">
                    <div className={styles.mpNegotiable}>
                      <Tag size={12} />{item.isNegotiable ? 'Negotiable' : 'Fixed'}
                    </div>
                    <button className="mp-msg-btn"><MessageCircle size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  )
}

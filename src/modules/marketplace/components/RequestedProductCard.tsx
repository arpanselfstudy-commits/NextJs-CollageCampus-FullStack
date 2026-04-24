import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { MessageCircle, Tag } from 'lucide-react'
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { RequestedProduct } from '@/modules/marketplace/types'
import styles from './MarketplaceView.module.css'

export interface RequestedProductCardProps {
  item: RequestedProduct
  /** 'main' = full marketplace grid card, 'compact' = landing page card */
  variant?: 'main' | 'compact'
}

export default function RequestedProductCard({ item, variant = 'main' }: RequestedProductCardProps) {
  const categoryLabel = (CATEGORY_LABEL[item.category as ListedProductCategory] ?? (item.category || 'REQUEST')).toUpperCase()

  if (variant === 'compact') {
    return (
      <div className="mp-card">
        <div className="mp-card-img" style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' }}>
          {item.images[0]
            ? <FallbackImage src={item.images[0]} alt={item.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.mpCardImgCoverDim} />
            : <MessageCircle size={56} color="white" strokeWidth={1} />
          }
          <span className="mp-card-price">${item.price.from}–${item.price.to}</span>
        </div>
        <div className="mp-card-body">
          <div className="mp-card-category">
            <span className={styles.catBadge} style={{ background: '#fce7f3', color: '#9d174d' }}>
              {categoryLabel}
            </span>
            {item.isFulfilled && <span className={styles.fulfilledBadge}>Fulfilled</span>}
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
    )
  }

  return (
    <Link href={`/marketplace/request/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="mp-card">
        <div className={`mp-card-img ${styles.mpCardImgWrap}`} style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' }}>
          <FallbackImage src={item.images[0]} alt={item.name} fill sizes="(max-width: 768px) 100vw, 300px" className={styles.mpCardImgDim} />
          <span className="mp-card-price">${item.price.from}–${item.price.to}</span>
        </div>
        <div className="mp-card-body">
          <div className="mp-card-category">
            <span className={styles.catBadge} style={{ background: '#fce7f3', color: '#9d174d' }}>
              {categoryLabel}
            </span>
            {item.isFulfilled && <span className={styles.fulfilledBadge}>Fulfilled</span>}
          </div>
          <div className="mp-card-title">{item.name}</div>
          <div className="mp-card-seller">
            <div className="mp-seller-info">
              <div className="mp-seller-avatar">{item.user?.[0]?.toUpperCase() ?? 'U'}</div>
              <div><div className="mp-seller-name">{item.isNegotiable ? 'Negotiable' : 'Fixed'}</div></div>
            </div>
            <button className="mp-msg-btn"><MessageCircle size={14} /></button>
          </div>
        </div>
      </div>
    </Link>
  )
}

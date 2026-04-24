'use client'

import { MessageCircle, CheckCircle, Tag } from 'lucide-react'
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { RequestedProduct } from '@/modules/marketplace/types'
import styles from './RequestDetailView.module.css'

interface RequestInfoCardProps {
  request: RequestedProduct
  onShowContact: () => void
}

export default function RequestInfoCard({ request, onShowContact }: RequestInfoCardProps) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.badges}>
        <span className={styles.catBadge}>
          {CATEGORY_LABEL[request.category as ListedProductCategory] ?? request.category}
        </span>
        {request.isNegotiable && (
          <span className={styles.negotiableBadge}>
            <CheckCircle size={10} /> Negotiable
          </span>
        )}
      </div>

      <h1 className={styles.title}>{request.name}</h1>

      <div className={styles.priceRow}>
        <Tag size={14} color="#3730d4" />
        <span className={styles.price}>
          ${request.price.from.toLocaleString()} – ${request.price.to.toLocaleString()}
        </span>
      </div>

      <button
        onClick={onShowContact}
        disabled={request.isFulfilled}
        className={`${styles.ctaBtn} ${request.isFulfilled ? styles['ctaBtn--disabled'] : ''}`}
      >
        <MessageCircle size={16} />
        {request.isFulfilled ? 'Request Fulfilled' : 'Contact Requester'}
      </button>
    </div>
  )
}

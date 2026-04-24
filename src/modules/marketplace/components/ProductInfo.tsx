'use client'

import { MessageCircle, CheckCircle, Clock } from 'lucide-react'
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { ListedProduct } from '@/modules/marketplace/types'
import styles from './ProductDetailView.module.css'

interface ProductInfoProps {
  product: ListedProduct
  onShowContact: () => void
}

export default function ProductInfo({ product, onShowContact }: ProductInfoProps) {
  return (
    <div className="product-info">
      <div className="product-badges">
        <span className={styles.catBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>
          {CATEGORY_LABEL[product.category as ListedProductCategory] ?? product.category}
        </span>
        <span
          className={styles.availBadge}
          style={{
            background: product.isAvailable ? '#dcfce7' : '#fef2f2',
            color: product.isAvailable ? '#166534' : '#991b1b',
          }}
        >
          {product.isAvailable ? 'Available' : 'Sold'}
        </span>
      </div>

      <h1 className="product-title">{product.productName}</h1>

      <div className="product-price-row">
        <span className="product-price">${product.price}</span>
        {product.isNegotiable && (
          <span className={styles.negotiable}>
            <CheckCircle size={14} /> Negotiable
          </span>
        )}
      </div>

      <div className="product-meta-card">
        <div>
          <div className="product-meta-label">Condition</div>
          <div className="product-meta-value">
            <span className="condition-badge">{product.condition}</span>
          </div>
        </div>
        <div>
          <div className="product-meta-label">Years Used</div>
          <div className={`product-meta-value ${styles.yearUsed}`}>
            <Clock size={13} /> {product.yearUsed} {product.yearUsed === 1 ? 'year' : 'years'}
          </div>
        </div>
      </div>

      <div className="product-desc-label">Description</div>
      <p className="product-desc">{product.description}</p>

      <div className="product-cta-stack">
        <button
          className="btn btn-primary"
          onClick={onShowContact}
          disabled={!product.isAvailable}
        >
          <MessageCircle size={16} /> Contact Seller
        </button>
      </div>
    </div>
  )
}

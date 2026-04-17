'use client'

import '@/styles/design.css'
import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import BackButton from '@/components/common/BackButton/BackButton'
import { ShoppingBag, MessageCircle, CheckCircle, Clock } from 'lucide-react'
import { PageLoader } from '@/components/common/Loader/Loader'
import dynamic from 'next/dynamic'
const ContactModalWithPhoto = dynamic(() => import('@/components/common/Modal/ContactModalWithPhoto'), { ssr: false, loading: () => null })
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { ListedProduct } from '@/modules/marketplace/types'
import styles from './ProductDetailView.module.css'

export interface ProductDetailViewProps {
  product?: ListedProduct
  isLoading: boolean
  activeImg: number
  onImgChange: (i: number) => void
  showContact: boolean
  onShowContact: () => void
  onCloseContact: () => void
}

export default function ProductDetailView({ product, isLoading, activeImg, onImgChange, showContact, onShowContact, onCloseContact }: ProductDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><PageLoader /></div>
  if (!product) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundBody}>
        <ShoppingBag size={48} color="#9ca3af" strokeWidth={1} />
        <p>Product not found.</p>
        <Link href="/marketplace" style={{ color: 'var(--color-primary)', fontWeight: 600 }}><BackButton href="/marketplace" label="Back to Marketplace" /></Link>
      </div>
    </div>
  )
  return (
    <div className="product-page">
      <div className="product-back">
        <BackButton href="/marketplace" label="Back to Marketplace" />
      </div>
      <div className="product-body">
        <div className="product-gallery">
          <div className={`product-main-img ${styles.galleryImgWrap}`} style={{ background: '#1a1a2e', position: 'relative' }}>
            {product.images[activeImg] ? <FallbackImage src={product.images[activeImg]} alt={product.productName} fill sizes="(max-width: 768px) 100vw, 600px" className={styles.galleryImgCover} priority={activeImg === 0} /> : <ShoppingBag size={100} color="rgba(255,255,255,0.2)" strokeWidth={1} />}
            <span className="product-featured-badge">{product.condition}</span>
          </div>
          {product.images.length > 1 && (
            <div className="product-thumbs">
              {product.images.map((img, i) => (
                <div key={i} onClick={() => onImgChange(i)} className={`product-thumb${i === activeImg ? ' product-thumb--active' : ''}`} style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                  <FallbackImage src={img} alt="" fill sizes="80px" className={styles.thumbImg} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <div className="product-badges">
            <span className={styles.catBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>{CATEGORY_LABEL[product.category as ListedProductCategory] ?? product.category}</span>
            <span className={styles.availBadge} style={{ background: product.isAvailable ? '#dcfce7' : '#fef2f2', color: product.isAvailable ? '#166534' : '#991b1b' }}>{product.isAvailable ? 'Available' : 'Sold'}</span>
          </div>
          <h1 className="product-title">{product.productName}</h1>
          <div className="product-price-row">
            <span className="product-price">${product.price}</span>
            {product.isNegotiable && <span className={styles.negotiable}><CheckCircle size={14} /> Negotiable</span>}
          </div>
          <div className="product-meta-card">
            <div>
              <div className="product-meta-label">Condition</div>
              <div className="product-meta-value"><span className="condition-badge">{product.condition}</span></div>
            </div>
            <div>
              <div className="product-meta-label">Years Used</div>
              <div className={`product-meta-value ${styles.yearUsed}`}><Clock size={13} /> {product.yearUsed} {product.yearUsed === 1 ? 'year' : 'years'}</div>
            </div>
          </div>
          <div className="product-desc-label">Description</div>
          <p className="product-desc">{product.description}</p>
          <div className="product-cta-stack">
            <button className="btn btn-primary" onClick={onShowContact} disabled={!product.isAvailable}>
              <MessageCircle size={16} /> Contact Seller
            </button>
          </div>
        </div>
      </div>
      {showContact && (
        <div className="overlay">
          <ContactModalWithPhoto name="Seller" role={CATEGORY_LABEL[product.category as ListedProductCategory] ?? product.category} email={product.contactDetails.email} phone={product.contactDetails.phoneNo} onMessage={onCloseContact} onClose={onCloseContact} />
        </div>
      )}
    </div>
  )
}

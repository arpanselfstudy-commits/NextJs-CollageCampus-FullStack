'use client'

import '@/styles/design.css'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton/BackButton'
import { ShoppingBag } from 'lucide-react'
import { PageLoader } from '@/components/common/Loader/Loader'
import dynamic from 'next/dynamic'
const ContactModalWithPhoto = dynamic(() => import('@/components/common/Modal/ContactModalWithPhoto'), { ssr: false, loading: () => null })
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { ListedProduct } from '@/modules/marketplace/types'
import styles from './ProductDetailView.module.css'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'

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
        <Link href="/marketplace" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          <BackButton href="/marketplace" label="Back to Marketplace" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="product-page">
      <div className="product-back">
        <BackButton href="/marketplace" label="Back to Marketplace" />
      </div>

      <div className="product-body">
        <ProductGallery
          images={product.images}
          productName={product.productName}
          condition={product.condition}
          activeImg={activeImg}
          onImgChange={onImgChange}
        />
        <ProductInfo product={product} onShowContact={onShowContact} />
      </div>

      {showContact && (
        <div className="overlay">
          <ContactModalWithPhoto
            name="Seller"
            role={CATEGORY_LABEL[product.category as ListedProductCategory] ?? product.category}
            email={product.contactDetails.email}
            phone={product.contactDetails.phoneNo}
            onMessage={onCloseContact}
            onClose={onCloseContact}
          />
        </div>
      )}
    </div>
  )
}

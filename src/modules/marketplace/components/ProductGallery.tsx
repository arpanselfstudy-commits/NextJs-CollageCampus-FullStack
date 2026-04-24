'use client'

import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { ShoppingBag } from 'lucide-react'
import styles from './ProductDetailView.module.css'

interface ProductGalleryProps {
  images: string[]
  productName: string
  condition: string
  activeImg: number
  onImgChange: (i: number) => void
}

export default function ProductGallery({ images, productName, condition, activeImg, onImgChange }: ProductGalleryProps) {
  return (
    <div className="product-gallery">
      <div
        className={`product-main-img ${styles.galleryImgWrap}`}
        style={{ background: '#1a1a2e', position: 'relative' }}
      >
        {images[activeImg] ? (
          <FallbackImage
            src={images[activeImg]}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className={styles.galleryImgCover}
            priority={activeImg === 0}
          />
        ) : (
          <ShoppingBag size={100} color="rgba(255,255,255,0.2)" strokeWidth={1} />
        )}
        <span className="product-featured-badge">{condition}</span>
      </div>

      {images.length > 1 && (
        <div className="product-thumbs">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => onImgChange(i)}
              className={`product-thumb${i === activeImg ? ' product-thumb--active' : ''}`}
              style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
            >
              <FallbackImage src={img} alt="" fill sizes="80px" className={styles.thumbImg} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

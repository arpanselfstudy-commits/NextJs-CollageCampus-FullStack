'use client'

import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { Settings2, Trash2 } from 'lucide-react'
import styles from './account.module.css'

export interface ProfileProductCardProps {
  id: string
  imageSrc?: string
  imageAlt: string
  imageFallback: React.ReactNode
  /** e.g. 'Available' / 'Unavailable' / 'Fulfilled' / 'Active' */
  badgeLabel: string
  badgeBg: string
  badgeColor: string
  /** Optional dim overlay on the image (used for request cards) */
  dimImage?: boolean
  title: string
  price: string
  description: string
  manageHref: string
  onDelete: () => void
}

export default function ProfileProductCard({
  imageSrc,
  imageAlt,
  imageFallback,
  badgeLabel,
  badgeBg,
  badgeColor,
  dimImage,
  title,
  price,
  description,
  manageHref,
  onDelete,
}: ProfileProductCardProps) {
  return (
    <div className={styles.productCard}>
      <div
        className={`${styles.productCardImg} ${dimImage ? styles.productCardImgDim : ''}`}
        style={dimImage ? { background: 'linear-gradient(135deg,#1a1a2e,#2d2db0)', position: 'relative' } : { position: 'relative' }}
      >
        {imageSrc
          ? <FallbackImage src={imageSrc} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, 300px" />
          : imageFallback}
        <span
          className={styles.productCardBadge}
          style={{ background: badgeBg, color: badgeColor }}
        >
          {badgeLabel}
        </span>
      </div>

      <div className={styles.productCardBody}>
        <div className={styles.productCardRow}>
          <span className={styles.productCardTitle}>{title}</span>
          <span className={dimImage ? styles.productCardPriceMuted : styles.productCardPrice}>
            {price}
          </span>
        </div>
        <p className={styles.productCardDesc}>{description}</p>
        <div className={styles.productCardActions}>
          <Link href={manageHref} className={styles.manageBtn}>
            <Settings2 size={14} /> Manage
          </Link>
          <button onClick={onDelete} className={styles.deleteBtn}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

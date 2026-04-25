import React from 'react'
import styles from './SkeletonCard.module.css'

// Base shimmer block
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`${styles.shimmer} ${className ?? ''}`} style={style} />
}

// Job card skeleton — matches .job-card-main layout
export function JobCardSkeleton() {
  return (
    <div className={styles.jobCard}>
      <div className={styles.jobCardHeader}>
        <Shimmer className={styles.jobIcon} />
        <Shimmer className={styles.jobBadge} />
      </div>
      <Shimmer className={styles.jobTitle} />
      <Shimmer className={styles.jobMeta} />
      <Shimmer className={styles.jobMeta} style={{ width: '60%' }} />
      <Shimmer className={styles.jobMeta} style={{ width: '50%' }} />
      <Shimmer className={styles.jobBtn} />
    </div>
  )
}

// Shop card skeleton — matches .shop-card layout
export function ShopCardSkeleton() {
  return (
    <div className={styles.shopCard}>
      <Shimmer className={styles.shopImg} />
      <div className={styles.shopBody}>
        <div className={styles.shopHeaderRow}>
          <Shimmer className={styles.shopName} />
          <Shimmer className={styles.shopDist} />
        </div>
        <Shimmer className={styles.shopDesc} />
        <Shimmer className={styles.shopDeal} />
        <Shimmer className={styles.shopBtn} />
      </div>
    </div>
  )
}

// Marketplace card skeleton — matches .mp-card layout
export function MarketplaceCardSkeleton() {
  return (
    <div className={styles.mpCard}>
      <Shimmer className={styles.mpImg} />
      <div className={styles.mpBody}>
        <div className={styles.mpCatRow}>
          <Shimmer className={styles.mpCat} />
          <Shimmer className={styles.mpCond} />
        </div>
        <Shimmer className={styles.mpTitle} />
        <div className={styles.mpSellerRow}>
          <div className={styles.mpSellerInfo}>
            <Shimmer className={styles.mpAvatar} />
            <Shimmer className={styles.mpSellerName} />
          </div>
          <Shimmer className={styles.mpMsgBtn} />
        </div>
      </div>
    </div>
  )
}

// Grid wrappers — render N skeletons in the right grid class
export function JobsSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="jobs-grid-main">
      {Array.from({ length: count }).map((_, i) => <JobCardSkeleton key={i} />)}
    </div>
  )
}

export function ShopsSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="shops-grid">
      {Array.from({ length: count }).map((_, i) => <ShopCardSkeleton key={i} />)}
    </div>
  )
}

export function MarketplaceSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="mp-grid">
      {Array.from({ length: count }).map((_, i) => <MarketplaceCardSkeleton key={i} />)}
    </div>
  )
}

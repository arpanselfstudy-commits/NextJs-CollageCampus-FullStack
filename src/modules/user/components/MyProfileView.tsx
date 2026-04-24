'use client'

import '@/styles/design.css'
import { useState } from 'react'
import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { Plus, ClipboardList, ShoppingBag } from 'lucide-react'
import { MarketplaceCardSkeleton } from '@/components/common/Loader/SkeletonCard'
import ConfirmModal from '@/components/common/Modal/ConfirmModal'
import ProfileProductCard from './ProfileProductCard'
import ProfileHeader from './ProfileHeader'
import type { AuthUser } from '@/modules/auth/types'
import type { ListedProduct, RequestedProduct } from '@/modules/marketplace/types'
import styles from './account.module.css'

export interface MyProfileViewProps {
  user: AuthUser | null
  tab: 'listings' | 'requests'
  onTabChange: (t: 'listings' | 'requests') => void
  listings: ListedProduct[]
  listedLoading: boolean
  requests: RequestedProduct[]
  requestedLoading: boolean
  onDeleteListed: (id: string) => void
  onDeleteRequested: (id: string) => void
}

export default function MyProfileView({
  user,
  tab,
  onTabChange,
  listings,
  listedLoading,
  requests,
  requestedLoading,
  onDeleteListed,
  onDeleteRequested,
}: MyProfileViewProps) {
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    type: 'listing' | 'request'
    name: string
  } | null>(null)

  const handleConfirmDelete = () => {
    if (!pendingDelete) return
    if (pendingDelete.type === 'listing') onDeleteListed(pendingDelete.id)
    else onDeleteRequested(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      <div className={styles.content}>

        {/* Profile header */}
        <ProfileHeader user={user} />

        {/* Tabs + actions */}
        <div className={styles.tabsRow}>
          <div className={styles.tabs}>
            {(['listings', 'requests'] as const).map((key) => (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`${styles.tab} ${tab === key ? styles['tab--active'] : ''}`}
              >
                {key === 'listings'
                  ? `My Listings (${listings.length})`
                  : `My Requests (${requests.length})`}
              </button>
            ))}
          </div>
          <div className={styles.tabActions}>
            <Link href="/account/list-product" className={styles.tabActionPrimary}>
              <Plus size={14} /> List Product
            </Link>
            <Link href="/account/request-product" className={styles.tabActionSecondary}>
              <ClipboardList size={14} /> Request Item
            </Link>
          </div>
        </div>

        {/* Listings tab */}
        {tab === 'listings' && (
          listedLoading ? (
            <div className={styles.grid3}>
              {Array.from({ length: 6 }).map((_, i) => <MarketplaceCardSkeleton key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>
                No listings yet.{' '}
                <Link href="/account/list-product" className={styles.emptyLink}>
                  List your first product
                </Link>
              </p>
            </div>
          ) : (
            <div className={styles.grid3}>
              {listings.map((item) => (
                <ProfileProductCard
                  key={item._id}
                  id={item._id ?? ''}
                  imageSrc={item.images[0]}
                  imageAlt={item.productName}
                  imageFallback={<ShoppingBag size={48} color="#3730d4" strokeWidth={1} />}
                  badgeLabel={item.isAvailable ? 'Available' : 'Unavailable'}
                  badgeBg={item.isAvailable ? '#dcfce7' : '#fef9c3'}
                  badgeColor={item.isAvailable ? '#166534' : '#854d0e'}
                  title={item.productName}
                  price={`$${item.price}`}
                  description={item.description}
                  manageHref={`/account/manage-listing/${item._id}`}
                  onDelete={() =>
                    item._id &&
                    setPendingDelete({ id: item._id, type: 'listing', name: item.productName })
                  }
                />
              ))}
            </div>
          )
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          requestedLoading ? (
            <div className={styles.grid3}>
              {Array.from({ length: 6 }).map((_, i) => <MarketplaceCardSkeleton key={i} />)}
            </div>
          ) : requests.length === 0 ? (
            <div className={styles.emptyState}>
              <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>
                No requests yet.{' '}
                <Link href="/account/request-product" className={styles.emptyLink}>
                  Post your first request
                </Link>
              </p>
            </div>
          ) : (
            <div className={styles.grid3}>
              {requests.map((item) => (
                <ProfileProductCard
                  key={item._id}
                  id={item._id ?? ''}
                  imageSrc={item.images[0]}
                  imageAlt={item.name}
                  imageFallback={<ClipboardList size={48} color="white" strokeWidth={1} />}
                  badgeLabel={item.isFulfilled ? 'Fulfilled' : 'Active'}
                  badgeBg={item.isFulfilled ? '#dcfce7' : '#e0e7ff'}
                  badgeColor={item.isFulfilled ? '#166534' : '#3730a3'}
                  dimImage
                  title={item.name}
                  price={`$${item.price.from}–$${item.price.to}`}
                  description={item.description}
                  manageHref={`/account/manage-request/${item._id}`}
                  onDelete={() =>
                    item._id &&
                    setPendingDelete({ id: item._id, type: 'request', name: item.name })
                  }
                />
              ))}
            </div>
          )
        )}
      </div>

      {pendingDelete && (
        <div className="overlay">
          <ConfirmModal
            variant="danger"
            title="Delete confirmation"
            description={`Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleConfirmDelete}
            onCancel={() => setPendingDelete(null)}
          />
        </div>
      )}
    </>
  )
}

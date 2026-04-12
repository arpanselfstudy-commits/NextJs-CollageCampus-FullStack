'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import BackButton from '@/components/common/BackButton/BackButton'
import { MessageCircle, CheckCircle, Tag } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { PageLoader } from '@/components/common/Loader/Loader'
import dynamic from 'next/dynamic'
const ContactModal = dynamic(() => import('@/components/common/Modal/ContactModal'), { ssr: false, loading: () => null })
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { RequestedProduct } from '@/modules/marketplace/types'
import styles from './RequestDetailView.module.css'

export interface RequestDetailViewProps {
  request?: RequestedProduct
  isLoading: boolean
  showContact: boolean
  onShowContact: () => void
  onCloseContact: () => void
}

export default function RequestDetailView({ request, isLoading, showContact, onShowContact, onCloseContact }: RequestDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><AppHeader /><PageLoader /></div>
  if (!request) return (
    <div className={styles.notFound}>
      <AppHeader />
      <div className={styles.notFoundBody}>
        <MessageCircle size={48} color="#9ca3af" strokeWidth={1} />
        <p>Request not found.</p>
        <Link href="/marketplace" style={{ color: 'var(--color-primary)', fontWeight: 600 }}><BackButton href="/marketplace" label="Back to Marketplace" /></Link>
      </div>
    </div>
  )
  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.backWrap}>
        <BackButton href="/marketplace" label="Back to Marketplace" />
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.imgWrap} style={{ position: 'relative' }}>
            {request.images[0] ? <Image src={request.images[0]} alt={request.name} fill sizes="(max-width: 768px) 100vw, 500px" className={styles.imgCover} priority /> : <MessageCircle size={80} color="rgba(255,255,255,0.2)" strokeWidth={1} />}
            <span className={styles.statusBadge} style={{ background: request.isFulfilled ? '#dcfce7' : '#2a14b4', color: request.isFulfilled ? '#166534' : 'white' }}>
              {request.isFulfilled ? 'Fulfilled' : 'Active Request'}
            </span>
          </div>
          <div className={styles.descCard}>
            <h3 className={styles.descTitle}>About this Request</h3>
            <p className={styles.descText}>{request.description}</p>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.infoCard}>
            <div className={styles.badges}>
              <span className={styles.catBadge}>{CATEGORY_LABEL[request.category as ListedProductCategory] ?? request.category}</span>
              {request.isNegotiable && <span className={styles.negotiableBadge}><CheckCircle size={10} /> Negotiable</span>}
            </div>
            <h1 className={styles.title}>{request.name}</h1>
            <div className={styles.priceRow}>
              <Tag size={14} color="#3730d4" />
              <span className={styles.price}>${request.price.from.toLocaleString()} – ${request.price.to.toLocaleString()}</span>
            </div>
            <button onClick={onShowContact} disabled={request.isFulfilled} className={`${styles.ctaBtn} ${request.isFulfilled ? styles['ctaBtn--disabled'] : ''}`}>
              <MessageCircle size={16} />
              {request.isFulfilled ? 'Request Fulfilled' : 'Contact Requester'}
            </button>
          </div>
        </div>
      </div>
      <AppFooter />
      {showContact && (
        <div className="overlay">
          <ContactModal name="Requester" role={CATEGORY_LABEL[request.category as ListedProductCategory] ?? request.category} email={request.contactDetails.email} phone={request.contactDetails.phoneNo} onMessage={onCloseContact} onClose={onCloseContact} />
        </div>
      )}
    </div>
  )
}

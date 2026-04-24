'use client'

import '@/styles/design.css'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton/BackButton'
import { MessageCircle } from 'lucide-react'
import { PageLoader } from '@/components/common/Loader/Loader'
import dynamic from 'next/dynamic'
const ContactModal = dynamic(() => import('@/components/common/Modal/ContactModal'), { ssr: false, loading: () => null })
import { CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import type { RequestedProduct } from '@/modules/marketplace/types'
import styles from './RequestDetailView.module.css'
import RequestImage from './RequestImage'
import RequestDescription from './RequestDescription'
import RequestInfoCard from './RequestInfoCard'

export interface RequestDetailViewProps {
  request?: RequestedProduct
  isLoading: boolean
  showContact: boolean
  onShowContact: () => void
  onCloseContact: () => void
}

export default function RequestDetailView({ request, isLoading, showContact, onShowContact, onCloseContact }: RequestDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><PageLoader /></div>

  if (!request) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundBody}>
        <MessageCircle size={48} color="#9ca3af" strokeWidth={1} />
        <p>Request not found.</p>
        <Link href="/marketplace" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          <BackButton href="/marketplace" label="Back to Marketplace" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.backWrap}>
        <BackButton href="/marketplace" label="Back to Marketplace" />
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          <RequestImage
            imageSrc={request.images[0]}
            name={request.name}
            isFulfilled={request.isFulfilled}
          />
          <RequestDescription description={request.description} />
        </div>

        <div className={styles.right}>
          <RequestInfoCard request={request} onShowContact={onShowContact} />
        </div>
      </div>

      {showContact && (
        <div className="overlay">
          <ContactModal
            name="Requester"
            role={CATEGORY_LABEL[request.category as ListedProductCategory] ?? request.category}
            email={request.contactDetails.email}
            phone={request.contactDetails.phoneNo}
            onMessage={onCloseContact}
            onClose={onCloseContact}
          />
        </div>
      )}
    </div>
  )
}

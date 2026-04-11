'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Mail, Clock, Store as StoreIcon, Tag } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { PageLoader } from '@/components/common/Loader/Loader'
import { DAYS_OF_WEEK } from '@/utils/globalStaticData'
import type { Shop } from '@/modules/shops/types'
import styles from './ShopDetailView.module.css'

export interface ShopDetailViewProps {
  shop?: Shop
  isLoading: boolean
}

export default function ShopDetailView({ shop, isLoading }: ShopDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><AppHeader /><PageLoader /></div>
  if (!shop) return (
    <div className={styles.notFound}>
      <AppHeader />
      <div className={styles.notFoundBody}>
        <StoreIcon size={48} color="#9ca3af" strokeWidth={1} />
        <p>Shop not found.</p>
        <Link href="/shops" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Back to Shops</Link>
      </div>
    </div>
  )

  const todayKey = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const isOpenToday = shop.shopTiming?.[todayKey]?.isOpen

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.backWrap}>
        <Link href="/shops" className={styles.backLink}><ArrowLeft size={14} /> Back to Shops</Link>
      </div>
      <div className={styles.heroBanner} style={{ position: 'relative' }}>
        {shop.photo && <Image src={shop.photo} alt={shop.name} fill sizes="100vw" className={styles.heroBannerBg} priority />}
        <div className={styles.heroBannerOverlay} />
        <div className={styles.heroBannerContent}>
          <div className={styles.heroBadgeRow}>
            <span className={styles.heroBadge} style={{ background: isOpenToday ? '#dcfce7' : '#fef2f2', color: isOpenToday ? '#166534' : '#991b1b' }}>{isOpenToday ? '● Open Now' : '● Closed'}</span>
            <span className={styles.heroBadge} style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>{shop.type}</span>
          </div>
          <h1 className={styles.heroTitle}>{shop.name}</h1>
          <div className={styles.heroMeta}><MapPin size={13} />{shop.location} • {shop.distance}</div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.main}>
          {shop.offers.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><Tag size={16} color="#3730d4" /> Campus Exclusive Deals</h2>
              <div className={styles.offersGrid}>
                {shop.offers.map((offer) => (
                  <div key={offer.offerId} className={styles.offerCard}>
                    <div className={styles.offerTitle}>{offer.offerName}</div>
                    <div className={styles.offerDesc}>{offer.description}</div>
                    <div className={styles.offerDate}>Until {new Date(offer.endDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {shop.topItems.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Top Items</h2>
              <div className={styles.topItems}>
                {shop.topItems.map((item, i) => <span key={i} className={styles.topItem}>{item}</span>)}
              </div>
            </div>
          )}
          {shop.shopTiming && Object.keys(shop.shopTiming).length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><Clock size={16} color="#3730d4" /> Opening Hours</h2>
              <div className={styles.hoursRow}>
                {DAYS_OF_WEEK.map((day) => {
                  const t = shop.shopTiming[day]
                  if (!t) return null
                  const isToday = day === todayKey
                  return (
                    <div key={day} className={`${styles.hourItem} ${isToday ? styles['hourItem--today'] : ''}`}>
                      <span className={`${styles.hourDay} ${isToday ? styles['hourDay--today'] : ''}`}>{day}</span>
                      <span className={`${styles.hourTime} ${!t.isOpen ? styles.hourClosed : ''}`}>{t.isOpen ? `${t.opensAt} – ${t.closesAt}` : 'Closed'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Contact</h3>
            <div className={styles.contactRow}><Mail size={15} color="#3730d4" />{shop.contactDetails.email}</div>
            <div className={styles.contactRow}><Phone size={15} color="#3730d4" />{shop.contactDetails.phoneNo}</div>
            <div className={styles.contactRow}><MapPin size={15} color="#3730d4" />{shop.location}</div>
          </div>
          {shop.photos.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Photos</h3>
              <div className={styles.photosGrid}>
                {shop.photos.slice(0, 4).map((p, i) => (
                  <div key={i} className={styles.photoThumb} style={{ position: 'relative' }}><Image src={p} alt="" fill sizes="120px" /></div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
      <AppFooter />
    </div>
  )
}

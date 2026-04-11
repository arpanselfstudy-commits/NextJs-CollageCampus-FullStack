'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Pencil, Trash2, ClipboardList, Loader2, Check, X } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { PageLoader } from '@/components/common/Loader/Loader'
import type { RequestedProduct } from '@/modules/marketplace/types'
import styles from './account.module.css'

function Toggle({ on, onChange, teal = false }: { on: boolean; onChange: (v: boolean) => void; teal?: boolean }) {
  return (
    <div onClick={() => onChange(!on)} className={`${styles.toggle} ${on ? styles['toggle--on'] : ''} ${teal ? styles['toggle--teal'] : ''}`}>
      <div className={styles.toggleDot} />
    </div>
  )
}

export interface ManageRequestViewProps {
  request?: RequestedProduct
  isLoading: boolean
  editing: boolean
  onToggleEditing: () => void
  form: { name: string; category: string; priceFrom: number; priceTo: number; isNegotiable: boolean; isFulfilled: boolean; description: string; email: string; phoneNo: string }
  onFormChange: (k: string, v: unknown) => void
  onSave: () => void
  onCancelEdit: () => void
  onToggle: (key: 'isFulfilled' | 'isNegotiable', val: boolean) => void
  onDelete: () => void
  updating: boolean
  deleting: boolean
}

const inp = { width: '100%', padding: '12px 14px', background: '#f3f5fb', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#0b1c30', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' as const }
const lbl = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#6b7280', marginBottom: 6, display: 'block' }

export default function ManageRequestView({ request, isLoading, editing, onToggleEditing, form, onFormChange, onSave, onCancelEdit, onToggle, onDelete, updating, deleting }: ManageRequestViewProps) {
  if (isLoading) return <div className={styles.page}><AppHeader /><PageLoader /></div>
  if (!request) return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.emptyState} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ClipboardList size={48} color="#9ca3af" strokeWidth={1} />
        <p>Request not found. <Link href="/account/my-profile" className={styles.emptyLink}>← Back to profile</Link></p>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.contentWide}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/account/my-profile" className={styles.pageHeaderBack}><ArrowLeft size={18} /></Link>
          <div>
            <div className={styles.pageHeaderTag}>Request Management</div>
            <h1 className={styles.pageHeaderTitle}>Manage Request</h1>
          </div>
        </div>

        <div className={styles.manageGrid}>
          <div className={styles.manageLeft}>
            <div className={styles.requestImgWrap} style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d1a4e)', position: 'relative' }}>
              {request.images[0] && <Image src={request.images[0]} alt={request.name} fill sizes="(max-width: 768px) 100vw, 500px" priority />}
              {!request.images[0] && <ClipboardList size={80} color="rgba(255,255,255,0.2)" strokeWidth={1} />}
              <span className={styles.requestStatusBadge} style={{ background: form.isFulfilled ? '#dcfce7' : '#2a14b4', color: form.isFulfilled ? '#166534' : 'white' }}>
                {form.isFulfilled ? 'Fulfilled' : 'Active'}
              </span>
            </div>

            {editing && (
              <div className={styles.editForm}>
                <h3 className={styles.editFormTitle}>Edit Request</h3>
                <div className={styles.editFormFields}>
                  <div><label style={lbl}>Product Name</label><input style={inp} value={form.name} onChange={(e) => onFormChange('name', e.target.value)} /></div>
                  <div><label style={lbl}>Category</label><input style={inp} value={form.category} onChange={(e) => onFormChange('category', e.target.value)} /></div>
                  <div className={styles.editFormGrid2}>
                    <div><label style={lbl}>Min Price ($)</label><input style={inp} type="number" min={0} value={form.priceFrom} onChange={(e) => onFormChange('priceFrom', Number(e.target.value))} /></div>
                    <div><label style={lbl}>Max Price ($)</label><input style={inp} type="number" min={0} value={form.priceTo} onChange={(e) => onFormChange('priceTo', Number(e.target.value))} /></div>
                  </div>
                  <div><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'none', height: 80 } as React.CSSProperties} value={form.description} onChange={(e) => onFormChange('description', e.target.value)} /></div>
                  <div className={styles.editFormGrid2}>
                    <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={(e) => onFormChange('email', e.target.value)} /></div>
                    <div><label style={lbl}>Phone</label><input style={inp} type="tel" value={form.phoneNo} onChange={(e) => onFormChange('phoneNo', e.target.value)} /></div>
                  </div>
                  <div className={styles.editFormActions}>
                    <button onClick={onSave} disabled={updating} className={styles.saveBtn}>
                      {updating ? <Loader2 size={16} className={styles.spin} /> : <Check size={16} />} Save Changes
                    </button>
                    <button onClick={onCancelEdit} className={styles.cancelBtn}><X size={16} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.manageRight}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>{request.name}</div>
              <div className={styles.infoCardPriceRow}>
                <span className={styles.infoCardPrice}>${request.price.from} – ${request.price.to}</span>
                {request.category && <span className={styles.infoCardBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>{request.category}</span>}
              </div>
              <p className={styles.infoCardDesc}>{request.description}</p>
            </div>

            <div className={styles.togglesCard}>
              {([
                { key: 'isFulfilled' as const, label: 'Request Fulfilled', sub: 'Hide from public marketplace', teal: true },
                { key: 'isNegotiable' as const, label: 'Open to Negotiate', sub: 'Allow price proposals', teal: false },
              ]).map((t, i) => (
                <div key={t.key} className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleTitle}>{t.label}</div>
                    <div className={styles.toggleSub}>{t.sub}</div>
                  </div>
                  <Toggle on={form[t.key]} onChange={(v) => onToggle(t.key, v)} teal={t.teal} />
                </div>
              ))}
            </div>

            <div className={styles.actionsRow}>
              <button onClick={onToggleEditing} className={styles.editDetailsBtn}><Pencil size={15} /> Edit Request</button>
              <button onClick={onDelete} disabled={deleting} className={styles.dangerBtn}>
                {deleting ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
              </button>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>Contact Details</div>
              <div className={styles.contactLine}>{request.contactDetails.email}</div>
              <div className={styles.contactLine}>{request.contactDetails.phoneNo}</div>
            </div>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}

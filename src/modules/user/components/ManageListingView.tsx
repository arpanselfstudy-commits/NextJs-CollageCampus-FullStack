'use client'

import '@/styles/design.css'
import Link from 'next/link'
import Image from 'next/image'
import BackButton from '@/components/common/BackButton/BackButton'
import { Pencil, Trash2, ShoppingBag, Loader2, Check, X, Package } from 'lucide-react'
import ConfirmModal from '@/components/common/Modal/ConfirmModal'
import { LISTED_CATEGORIES, LISTED_CONDITIONS, CATEGORY_LABEL, type ListedProductCategory, type ListedProductCondition } from '@/modules/marketplace/types'
import { PageLoader } from '@/components/common/Loader/Loader'
import type { ListedProduct } from '@/modules/marketplace/types'
import { BLUR_DATA_URL } from '@/lib/upload/constants'
import styles from './account.module.css'

function Toggle({ on, onChange, teal = false }: { on: boolean; onChange: (v: boolean) => void; teal?: boolean }) {
  return (
    <div onClick={() => onChange(!on)} className={`${styles.toggle} ${on ? styles['toggle--on'] : ''} ${teal ? styles['toggle--teal'] : ''}`}>
      <div className={styles.toggleDot} />
    </div>
  )
}

export interface ManageListingViewProps {
  product?: ListedProduct
  isLoading: boolean
  editing: boolean
  onToggleEditing: () => void
  form: { productName: string; category: ListedProductCategory; price: string; description: string; condition: ListedProductCondition; yearUsed: number; isNegotiable: boolean; isAvailable: boolean; email: string; phoneNo: string }
  onFormChange: (k: string, v: unknown) => void
  onSave: () => void
  onCancelEdit: () => void
  onToggleAvailable: (val: boolean) => void
  onDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  confirmDelete: boolean
  updating: boolean
  deleting: boolean
}

const inp = { width: '100%', padding: '12px 14px', background: '#f3f5fb', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#0b1c30', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' as const }
const lbl = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#6b7280', marginBottom: 6, display: 'block' }

export default function ManageListingView({ product, isLoading, editing, onToggleEditing, form, onFormChange, onSave, onCancelEdit, onToggleAvailable, onDelete, onConfirmDelete, onCancelDelete, confirmDelete, updating, deleting }: ManageListingViewProps) {
  if (isLoading) return <div className={styles.page}><PageLoader /></div>
  if (!product) return (
    <div className={styles.page}>
      <div className={styles.emptyState} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={48} color="#9ca3af" strokeWidth={1} />
        <p>Product not found. <BackButton href="/account/my-profile" label="Back to profile" /></p>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.contentWide}>
        <div className={styles.pageHeader} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <BackButton href="/account/my-profile" label="Back to Profile" />
          <div>
            <div className={styles.pageHeaderTag}>Inventory Management</div>
            <h1 className={styles.pageHeaderTitle}>Manage Listed Product</h1>
          </div>
        </div>

        <div className={styles.manageGrid}>
          <div className={styles.manageLeft}>
            <div className={styles.manageImgWrap} style={{ background: 'linear-gradient(135deg,#0a0a1a,#1a1a3e)', position: 'relative' }}>
              {product.images[0] && <Image src={product.images[0]} alt={product.productName} fill sizes="(max-width: 768px) 100vw, 500px" priority placeholder="blur" blurDataURL={BLUR_DATA_URL} />}
              {!product.images[0] && <ShoppingBag size={80} color="rgba(255,255,255,0.2)" strokeWidth={1} />}
              <span className={styles.manageImgId}>{product._id?.slice(-8).toUpperCase()}</span>
            </div>

            {editing && (
              <div className={styles.editForm}>
                <h3 className={styles.editFormTitle}>Edit Details</h3>
                <div className={styles.editFormFields}>
                  <div><label style={lbl}>Product Name</label><input style={inp} value={form.productName} onChange={(e) => onFormChange('productName', e.target.value)} /></div>
                  <div className={styles.editFormGrid2}>
                    <div>
                      <label style={lbl}>Category</label>
                      <select style={{ ...inp, appearance: 'none' as const }} value={form.category} onChange={(e) => onFormChange('category', e.target.value as ListedProductCategory)}>
                        {LISTED_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Price ($)</label><input style={inp} type="number" value={form.price} onChange={(e) => onFormChange('price', e.target.value)} /></div>
                  </div>
                  <div><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'none', height: 80 } as React.CSSProperties} value={form.description} onChange={(e) => onFormChange('description', e.target.value)} /></div>
                  <div className={styles.editFormGrid2}>
                    <div>
                      <label style={lbl}>Condition</label>
                      <div className={styles.conditionBtns}>
                        {LISTED_CONDITIONS.map((c) => (
                          <button key={c} type="button" onClick={() => onFormChange('condition', c as ListedProductCondition)} className={`${styles.conditionBtn} ${form.condition === c ? styles['conditionBtn--active'] : styles['conditionBtn--inactive']}`}>
                            {c === 'NEW' ? 'New' : c === 'USED' ? 'Used' : 'Refurb'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><label style={lbl}>Years Used</label><input style={inp} type="number" min={0} value={form.yearUsed} onChange={(e) => onFormChange('yearUsed', Number(e.target.value))} /></div>
                  </div>
                  <div className={styles.editFormGrid2}>
                    <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={(e) => onFormChange('email', e.target.value)} /></div>
                    <div><label style={lbl}>Phone</label><input style={inp} type="tel" value={form.phoneNo} onChange={(e) => onFormChange('phoneNo', e.target.value)} /></div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isNegotiable} onChange={(e) => onFormChange('isNegotiable', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2a14b4' }} />
                    Open to Negotiation
                  </label>
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
              <div className={styles.infoCardTitle}>{product.productName}</div>
              <div className={styles.infoCardPriceRow}>
                <span className={styles.infoCardPrice}>${product.price}</span>
                <span className={styles.infoCardBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>{product.category}</span>
                <span className={styles.infoCardBadge} style={{ background: '#f3f4f6', color: '#6b7280' }}>{product.condition}</span>
              </div>
              <p className={styles.infoCardDesc}>{product.description}</p>
              {product.isNegotiable && <p className={styles.infoCardNote}>✓ Open to negotiation</p>}
            </div>

            <div className={styles.togglesCard}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleLeft}>
                  <div className={styles.toggleIcon}><Package size={18} color="#2a14b4" /></div>
                  <div><div className={styles.toggleTitle}>Available</div><div className={styles.toggleSub}>Show this listing publicly</div></div>
                </div>
                <Toggle on={form.isAvailable} onChange={onToggleAvailable} />
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button onClick={onToggleEditing} className={styles.editDetailsBtn}><Pencil size={15} /> Edit Details</button>
              <button onClick={onDelete} disabled={deleting} className={styles.dangerBtn}>
                {deleting ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
              </button>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>Contact Details</div>
              <div className={styles.contactLine}>{product.contactDetails.email}</div>
              <div className={styles.contactLine}>{product.contactDetails.phoneNo}</div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="overlay">
          <ConfirmModal
            variant="danger"
            title="Delete listing?"
            description={`Are you sure you want to delete "${product?.productName}"? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={deleting}
            onConfirm={onConfirmDelete}
            onCancel={onCancelDelete}
          />
        </div>
      )}
    </div>
  )
}

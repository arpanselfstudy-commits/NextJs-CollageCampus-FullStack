'use client'

import '@/styles/design.css'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import BackButton from '@/components/common/BackButton/BackButton'
import { Pencil, Trash2, ClipboardList, Loader2, Check, X } from 'lucide-react'
import ConfirmModal from '@/components/common/Modal/ConfirmModal'
import { PageLoader } from '@/components/common/Loader/Loader'
import Input from '@/components/common/Input/Input'
import type { RequestedProduct } from '@/modules/marketplace/types'
import styles from './account.module.css'
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import type { ManageRequestForm } from '@/modules/user/types'

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
  register: UseFormRegister<ManageRequestForm>
  errors: FieldErrors<ManageRequestForm>
  watch: UseFormWatch<ManageRequestForm>
  setValue: UseFormSetValue<ManageRequestForm>
  onSave: (e?: React.BaseSyntheticEvent) => void
  onCancelEdit: () => void
  onToggle: (key: 'isFulfilled' | 'isNegotiable', val: boolean) => void
  onDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  confirmDelete: boolean
  updating: boolean
  deleting: boolean
}

export default function ManageRequestView({ request, isLoading, editing, onToggleEditing, register, errors, watch, setValue, onSave, onCancelEdit, onToggle, onDelete, onConfirmDelete, onCancelDelete, confirmDelete, updating, deleting }: ManageRequestViewProps) {
  if (isLoading) return <div className={styles.page}><PageLoader /></div>
  if (!request) return (
    <div className={styles.page}>
      <div className={styles.emptyState} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ClipboardList size={48} color="#9ca3af" strokeWidth={1} />
        <p>Request not found. <BackButton href="/account/my-profile" label="Back to profile" /></p>
      </div>
    </div>
  )

  const isFulfilled = watch('isFulfilled')
  const isNegotiable = watch('isNegotiable')

  return (
    <div className={styles.page}>
      <div className={styles.contentWide}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <BackButton href="/account/my-profile" label="Back to Profile" />
          <div>
            <div className={styles.pageHeaderTag}>Request Management</div>
            <h1 className={styles.pageHeaderTitle}>Manage Request</h1>
          </div>
        </div>

        <div className={styles.manageGrid}>
          <div className={styles.manageLeft}>
            <div className={styles.requestImgWrap} style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d1a4e)', position: 'relative' }}>
              {request.images[0] && <FallbackImage src={request.images[0]} alt={request.name} fill sizes="(max-width: 768px) 100vw, 500px" priority />}
              {!request.images[0] && <ClipboardList size={80} color="rgba(255,255,255,0.2)" strokeWidth={1} />}
              <span className={styles.requestStatusBadge} style={{ background: isFulfilled ? '#dcfce7' : '#2a14b4', color: isFulfilled ? '#166534' : 'white' }}>
                {isFulfilled ? 'Fulfilled' : 'Active'}
              </span>
            </div>

            {editing && (
              <div className={styles.editForm}>
                <h3 className={styles.editFormTitle}>Edit Request</h3>
                <div className={styles.editFormFields}>

                  <Input
                    label="Product Name"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Category"
                    error={errors.category?.message}
                    {...register('category')}
                  />

                  <div className={styles.editFormGrid2}>
                    <Input
                      label="Min Price ($)"
                      type="number"
                      min={0}
                      error={errors.priceFrom?.message}
                      {...register('priceFrom', { valueAsNumber: true })}
                    />
                    <Input
                      label="Max Price ($)"
                      type="number"
                      min={0}
                      error={errors.priceTo?.message}
                      {...register('priceTo', { valueAsNumber: true })}
                    />
                  </div>

                  <Input
                    label="Description"
                    error={errors.description?.message}
                    {...register('description')}
                  />

                  <div className={styles.editFormGrid2}>
                    <Input
                      label="Email"
                      type="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      error={errors.phoneNo?.message}
                      {...register('phoneNo')}
                    />
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
                { key: 'isFulfilled' as const, label: 'Request Fulfilled', sub: 'Hide from public marketplace', teal: true, value: isFulfilled },
                { key: 'isNegotiable' as const, label: 'Open to Negotiate', sub: 'Allow price proposals', teal: false, value: isNegotiable },
              ]).map((t) => (
                <div key={t.key} className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleTitle}>{t.label}</div>
                    <div className={styles.toggleSub}>{t.sub}</div>
                  </div>
                  <Toggle on={t.value ?? false} onChange={(v) => onToggle(t.key, v)} teal={t.teal} />
                </div>
              ))}
            </div>

            <div className={styles.actionsRow}>
              <button onClick={onToggleEditing} className={styles.editDetailsBtn}><Pencil size={15} /> Edit Details</button>
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

      {confirmDelete && (
        <div className="overlay">
          <ConfirmModal
            variant="danger"
            title="Delete request?"
            description={`Are you sure you want to delete "${request?.name}"? This action cannot be undone.`}
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

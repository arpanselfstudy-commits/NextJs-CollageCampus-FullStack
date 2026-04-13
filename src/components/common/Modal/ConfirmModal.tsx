import { Loader2 } from 'lucide-react'
import styles from './Modal.module.css'

interface ConfirmModalProps {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  loading?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

export default function ConfirmModal({
  title = 'Are you sure?',
  description = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className={styles.modal}>
      <div className={styles.accentBar} style={variant === 'danger' ? { background: 'linear-gradient(to right,#ef4444,#dc2626)' } : undefined} />
      <div className={styles.body}>
        <div className={styles.iconWrap} style={variant === 'danger' ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' } : undefined}>
          {variant === 'danger' ? '🗑' : '↪'}
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>{description}</p>
        <button
          className={styles.btnPrimary}
          onClick={onConfirm}
          disabled={loading}
          style={variant === 'danger' ? { background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } : undefined}
        >
          {loading && <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />}
          {confirmLabel}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>
        <button className={styles.btnGhost} onClick={onCancel} disabled={loading}>{cancelLabel}</button>
      </div>
      <div className={styles.modalFooter}>
        <span className={styles.modalFooterText}>Academic Atelier Security</span>
      </div>
    </div>
  )
}

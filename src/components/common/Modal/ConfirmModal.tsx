import styles from './Modal.module.css'

interface ConfirmModalProps {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export default function ConfirmModal({
  title = 'Confirm Logout',
  description = "Are you sure you want to log out of Campus Next? You'll need to sign back in to manage your listings and requests.",
  confirmLabel = 'Log Out',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className={styles.modal}>
      <div className={styles.accentBar} />
      <div className={styles.body}>
        <div className={styles.iconWrap}>↪</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>{description}</p>
        <button className={styles.btnPrimary} onClick={onConfirm}>{confirmLabel}</button>
        <button className={styles.btnGhost} onClick={onCancel}>{cancelLabel}</button>
      </div>
      <div className={styles.modalFooter}>
        <span className={styles.modalFooterText}>Academic Atelier Security</span>
      </div>
    </div>
  )
}

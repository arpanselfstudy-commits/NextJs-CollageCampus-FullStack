import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import styles from './Modal.module.css'

interface ContactModalWithPhotoProps {
  name?: string
  role?: string
  email?: string
  phone?: string
  verifiedSince?: string
  photoSrc?: string
  onMessage?: () => void
  onClose?: () => void
}

export default function ContactModalWithPhoto({
  name = 'Julian Sterling',
  role = 'Engineering Senior',
  email = 'julian.s@campus.edu',
  phone = '+1 (555) 012-3456',
  verifiedSince = '2022',
  photoSrc,
  onMessage,
  onClose,
}: ContactModalWithPhotoProps) {
  return (
    <div className={styles.modal}>
      <div className={`${styles.contactHeader} ${styles.contactHeaderWithAvatar}`}>
        <h2 className={styles.contactHeaderTitle}>Seller Contact Details</h2>
      </div>
      <div className={styles.avatarWrap}>
        <div className={styles.avatar} style={{ position: 'relative' }}>
          {photoSrc
            ? <FallbackImage src={photoSrc} alt={name} fill sizes="80px" />
            : <span className={styles.avatarInitial}>{name.split(' ').map((n) => n[0]).join('')}</span>
          }
        </div>
      </div>
      <div className={`${styles.contactBody} ${styles.contactBodyWithAvatar}`}>
        <div className={styles.contactNameWrap}>
          <div className={styles.contactName}>{name}</div>
          <span className={styles.contactRole}>{role}</span>
        </div>
        {[{ icon: '✉', label: 'Email Address', value: email }, { icon: '📞', label: 'Phone Number', value: phone }].map((f) => (
          <div key={f.label} className={styles.field}>
            <div className={styles.fieldIcon}>{f.icon}</div>
            <div className={styles.fieldContent}>
              <div className={styles.fieldLabel}>{f.label}</div>
              <div className={styles.fieldValue}>{f.value}</div>
            </div>
            <button className={styles.copyBtn}>⎘</button>
          </div>
        ))}
        <div className={styles.verified}>
          <span className={styles.verifiedIcon}>✓</span>
          <span className={styles.verifiedText}>Verified Campus Seller since {verifiedSince}</span>
        </div>
        <button className={styles.contactBtnPrimary} onClick={onMessage}>Message {name.split(' ')[0]}</button>
        <button className={styles.contactBtnClose} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { SectionLoader } from '@/components/common/Loader/Loader'
import styles from './PolicyModal.module.css'

// Map prop type → CMS type key used by the API
const CMS_TYPE_MAP: Record<'Privacy' | 'Terms', string> = {
  Privacy: 'PRIVACY_POLICY',
  Terms: 'TERMS_AND_CONDITIONS',
}

interface PolicyModalProps {
  type: 'Privacy' | 'Terms'
  onClose: () => void
}

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/cms/${CMS_TYPE_MAP[type]}`)
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data
        setTitle(data?.title ?? (type === 'Privacy' ? 'Privacy Policy' : 'Terms & Conditions'))
        setContent(data?.content ?? '')
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [type])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title || (type === 'Privacy' ? 'Privacy Policy' : 'Terms & Conditions')}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className={styles.body}>
          {loading && <SectionLoader />}
          {error && <p className={styles.para} style={{ color: '#e53e3e' }}>Failed to load content. Please try again.</p>}
          {!loading && !error && content && (
            <div className={styles.htmlContent} dangerouslySetInnerHTML={{ __html: content }} />
          )}
          {!loading && !error && !content && (
            <p className={styles.para} style={{ color: '#9ca3af' }}>No content available.</p>
          )}
        </div>
      </div>
    </div>
  )
}

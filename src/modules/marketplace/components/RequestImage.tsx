'use client'

import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { MessageCircle } from 'lucide-react'
import styles from './RequestDetailView.module.css'

interface RequestImageProps {
  imageSrc?: string
  name: string
  isFulfilled: boolean
}

export default function RequestImage({ imageSrc, name, isFulfilled }: RequestImageProps) {
  return (
    <div className={styles.imgWrap} style={{ position: 'relative' }}>
      {imageSrc ? (
        <FallbackImage
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className={styles.imgCover}
          priority
        />
      ) : (
        <MessageCircle size={80} color="rgba(255,255,255,0.2)" strokeWidth={1} />
      )}
      <span
        className={styles.statusBadge}
        style={{
          background: isFulfilled ? '#dcfce7' : '#2a14b4',
          color: isFulfilled ? '#166534' : 'white',
        }}
      >
        {isFulfilled ? 'Fulfilled' : 'Active Request'}
      </span>
    </div>
  )
}

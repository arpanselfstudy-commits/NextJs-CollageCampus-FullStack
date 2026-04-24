'use client'

import styles from './RequestDetailView.module.css'

interface RequestDescriptionProps {
  description: string
}

export default function RequestDescription({ description }: RequestDescriptionProps) {
  return (
    <div className={styles.descCard}>
      <h3 className={styles.descTitle}>About this Request</h3>
      <p className={styles.descText}>{description}</p>
    </div>
  )
}

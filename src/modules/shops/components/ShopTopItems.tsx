'use client'

import styles from './ShopDetailView.module.css'

interface ShopTopItemsProps {
  items: string[]
}

export default function ShopTopItems({ items }: ShopTopItemsProps) {
  if (items.length === 0) return null

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Top Items</h2>
      <div className={styles.topItems}>
        {items.map((item, i) => (
          <span key={i} className={styles.topItem}>{item}</span>
        ))}
      </div>
    </div>
  )
}

'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import styles from './ShopDetailView.module.css'

interface ShopContactCardProps {
  email: string
  phoneNo: string
  location: string
}

export default function ShopContactCard({ email, phoneNo, location }: ShopContactCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Contact</h3>
      <div className={styles.contactRow}>
        <Mail size={15} color="#3730d4" />
        {email}
      </div>
      <div className={styles.contactRow}>
        <Phone size={15} color="#3730d4" />
        {phoneNo}
      </div>
      <div className={styles.contactRow}>
        <MapPin size={15} color="#3730d4" />
        {location}
      </div>
    </div>
  )
}

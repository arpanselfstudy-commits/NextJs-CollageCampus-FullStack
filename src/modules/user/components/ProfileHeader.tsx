'use client'

import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { Pencil } from 'lucide-react'
import type { AuthUser } from '@/modules/auth/types'
import styles from './account.module.css'

interface ProfileHeaderProps {
  user: AuthUser | null
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileAvatar} style={{ position: 'relative' }}>
        {user?.photo
          ? <FallbackImage src={user.photo} alt={user.name} fill sizes="80px" />
          : user?.name?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className={styles.profileInfo}>
        <div className={styles.profileName}>{user?.name ?? 'User'}</div>
        <div className={styles.profileEmail}>{user?.email}</div>
        <div className={styles.profileBadges}>
          <span className={styles.profileBadge}>{user?.role ?? 'USER'}</span>
        </div>
      </div>
      <Link href="/account/edit-profile" className={styles.editBtn}>
        <Pencil size={14} /> Edit Profile
      </Link>
    </div>
  )
}

'use client'

import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Briefcase, Store as StoreIcon, ShoppingBag, LogOut, UserCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuthStore } from '@/modules/auth/store/auth.store'
const ConfirmModal = dynamic(() => import('@/components/common/Modal/ConfirmModal'), { ssr: false, loading: () => null })
import styles from './AppHeader.module.css'

function BrandLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="CampusNext">
      <rect width="36" height="36" rx="10" fill="url(#brandGrad)" />
      <path d="M10 24 L18 10 L26 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M13.5 19.5 H22.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="24" r="2.5" fill="#a5b4fc" />
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a14b4" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function AppHeader() {
  const [showLogout, setShowLogout] = useState(false)
  const pathname = usePathname()
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)

  const isActive = (key: string) => pathname.startsWith(`/${key}`)

  const handleLogoutConfirm = async () => {
    setShowLogout(false)
    await logout()
  }

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/landing" className={styles.brand} aria-label="CampusNext Home">
          <BrandLogo />
          <span className={styles.brandText}>CampusNext</span>
        </Link>

        <div className={styles.navLinks}>
          {([
            { href: '/jobs',        label: 'Jobs',        key: 'jobs',        Icon: Briefcase   },
            { href: '/shops',       label: 'Shops',       key: 'shops',       Icon: StoreIcon   },
            { href: '/marketplace', label: 'Marketplace', key: 'marketplace', Icon: ShoppingBag },
          ] as const).map(({ href, label, key, Icon }) => (
            <Link key={key} href={href} className={`${styles.navLink} ${isActive(key) ? styles['navLink--active'] : ''}`}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        <div className={styles.navRight}>
          <Link href="/account/my-profile" className={styles.avatar} style={{ position: 'relative' }}>
            {user?.photo
              ? <FallbackImage src={user.photo} alt={user.name} fill sizes="36px" />
              : user?.name?.[0]?.toUpperCase() ?? <UserCircle size={18} />
            }
          </Link>
          <button className={styles.logoutBtn} onClick={() => setShowLogout(true)} title="Logout" aria-label="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {showLogout && (
        <div className="overlay">
          <ConfirmModal onConfirm={handleLogoutConfirm} onCancel={() => setShowLogout(false)} />
        </div>
      )}
    </>
  )
}

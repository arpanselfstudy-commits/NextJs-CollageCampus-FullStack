'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Briefcase, Store as StoreIcon, ShoppingBag, LogOut, UserCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuthStore } from '@/modules/auth/store/auth.store'
const ConfirmModal = dynamic(() => import('@/components/common/Modal/ConfirmModal'), { ssr: false, loading: () => null })
import styles from './AppHeader.module.css'

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
        <Link href="/landing" className={styles.brand}>CampusNext</Link>

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
              ? <Image src={user.photo} alt={user.name} fill sizes="36px" />
              : user?.name?.[0]?.toUpperCase() ?? <UserCircle size={18} />
            }
          </Link>
          <button className={styles.logoutBtn} onClick={() => setShowLogout(true)}>
            <LogOut size={13} /> Logout
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

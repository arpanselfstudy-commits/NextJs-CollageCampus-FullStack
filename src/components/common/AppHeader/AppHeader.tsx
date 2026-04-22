'use client'

import Link from 'next/link'
import FallbackImage from '@/components/common/FallbackImage/FallbackImage'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Briefcase, Store as StoreIcon, ShoppingBag, LogOut, UserCircle, User, PlusSquare, ClipboardList, Pencil } from 'lucide-react'
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

const MENU_ITEMS = [
  { href: '/account/my-profile',     label: 'My Account',          Icon: User          },
  { href: '/account/list-product',   label: 'List a Product',       Icon: PlusSquare    },
  { href: '/account/request-product',label: 'Request a Product',    Icon: ClipboardList },
  { href: '/account/edit-profile',   label: 'Edit Profile',         Icon: Pencil        },
] as const

export default function AppHeader() {
  const [showLogout, setShowLogout] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)

  const isActive = (key: string) => pathname.startsWith(`/${key}`)

  const handleLogoutConfirm = async () => {
    setShowLogout(false)
    await logout()
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

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
          <div ref={dropdownRef} className={styles.avatarWrap}>
            <button
              className={styles.avatar}
              onClick={() => setDropdownOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={dropdownOpen}
            >
              {user?.photo
                ? <FallbackImage src={user.photo} alt={user.name} fill sizes="36px" />
                : user?.name?.[0]?.toUpperCase() ?? <UserCircle size={18} />
              }
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                {/* User info header */}
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    {user?.photo
                      ? <FallbackImage src={user.photo} alt={user.name} fill sizes="40px" />
                      : user?.name?.[0]?.toUpperCase() ?? <UserCircle size={18} />
                    }
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{user?.name ?? 'Account'}</div>
                    <div className={styles.dropdownEmail}>{user?.email ?? ''}</div>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                {MENU_ITEMS.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}

                <div className={styles.dropdownDivider} />

                <button
                  className={`${styles.dropdownItem} ${styles['dropdownItem--danger']}`}
                  onClick={() => { setDropdownOpen(false); setShowLogout(true) }}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
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

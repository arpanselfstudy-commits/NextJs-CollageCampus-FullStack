import Link from 'next/link'
import Header from '@/components/common/Header/Header'
import Footer from '@/components/common/Footer/Footer'
import { SIDEBAR_LINKS } from '@/utils/globalStaticData'
import styles from './UserLayout.module.css'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Header />

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>My Account</div>
          <nav className={styles.sidebarNav}>
            {SIDEBAR_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={styles.sidebarLink}>
                <span className={styles.sidebarLink__icon}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className={styles.main}>{children}</main>
      </div>

      <Footer variant="protected" />
    </div>
  )
}

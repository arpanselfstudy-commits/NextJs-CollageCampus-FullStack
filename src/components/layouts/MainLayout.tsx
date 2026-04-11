import Header from '@/components/common/Header/Header'
import Footer from '@/components/common/Footer/Footer'
import styles from './MainLayout.module.css'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer variant="protected" />
    </div>
  )
}

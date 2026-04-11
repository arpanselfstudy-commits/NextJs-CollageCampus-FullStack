import styles from './AppFooter.module.css'

export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>Campus Next</span>
      <span>© {new Date().getFullYear()} Campus Next. The Academic Atelier.</span>
      <div className={styles.links}>
        {['Privacy', 'Terms'].map((l) => (
          <a key={l} href="#" className={styles.link}>{l}</a>
        ))}
      </div>
    </footer>
  )
}

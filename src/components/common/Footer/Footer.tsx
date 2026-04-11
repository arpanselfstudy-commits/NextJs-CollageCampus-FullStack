import Link from 'next/link'
import styles from './Footer.module.css'
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_EXPLORE_LINKS,
  FOOTER_ACCOUNT_LINKS,
} from '@/utils/globalStaticData'

export type FooterVariant = 'default' | 'auth' | 'protected'

interface FooterProps {
  variant?: FooterVariant
}

function getLegalLinks(variant: FooterVariant) {
  switch (variant) {
    case 'auth':      return FOOTER_LEGAL_LINKS.filter((l) => l.label !== 'Contact')
    case 'protected': return FOOTER_LEGAL_LINKS.filter((l) => l.label !== 'Support' && l.label !== 'Safety')
    default:          return [...FOOTER_LEGAL_LINKS]
  }
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const legalLinks = getLegalLinks(variant)
  const year = new Date().getFullYear()

  if (variant === 'auth') {
    return (
      <footer className={`${styles.footer} ${styles['footer--auth']}`}>
        <div className={styles.footer__authRow}>
          <Link href="/" className={styles.footer__authLogo}>Campus Next</Link>
          <div className={styles.footer__authLinks}>
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className={styles.footer__authLink}>{l.label}</Link>
            ))}
          </div>
          <span className={styles.footer__authCopy}>© {year} Campus Next. The Academic Atelier.</span>
        </div>
      </footer>
    )
  }

  return (
    <footer className={`${styles.footer} ${styles['footer--full']}`}>
      <div className={styles.footer__top}>
        <div className={styles.footer__brand}>
          <Link href="/" className={styles.footer__logo}>CampusNext</Link>
          <p className={styles.footer__tagline}>
            The Academic Atelier — connecting students with local career paths, campus commerce, and a curated digital community.
          </p>
        </div>

        <div className={styles.footer__cols}>
          <div className={styles.footer__col}>
            <div className={styles.footer__colTitle}>Explore</div>
            <div className={styles.footer__colLinks}>
              {FOOTER_EXPLORE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.footer__colLink}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div className={styles.footer__col}>
            <div className={styles.footer__colTitle}>Account</div>
            <div className={styles.footer__colLinks}>
              {FOOTER_ACCOUNT_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.footer__colLink}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer__bottom}>
        <span className={styles.footer__copy}>© {year} Campus Next. The Academic Atelier.</span>
        <div className={styles.footer__legal}>
          {legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className={styles.footer__legalLink}>{l.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

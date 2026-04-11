import Link from 'next/link'
import Image from 'next/image'
import { HERO_IMAGES } from '@/utils/globalStaticData'
import styles from './landing.module.css'

export default function LandingHero() {
  return (
    <section className="landing-hero">
      <div>
        <h1 className="hero-title">
          The heartbeat<br />of your<br /><span>Academic<br />Atelier</span>
        </h1>
        <p className="hero-sub">
          Connecting students with local career paths, campus commerce, and a curated digital community.
        </p>
        <div className="hero-actions">
          <Link href="/marketplace" className="btn btn-primary">Explore Marketplace</Link>
          <Link href="/jobs" className="btn btn-outline">Find Jobs</Link>
        </div>
      </div>

      <div className="hero-images">
        {HERO_IMAGES.map(({ src, tall }) => (
          <div key={src} className={`hero-img${tall ? ' hero-img--tall' : ''} ${styles.heroImgWrap}`}>
            <Image
              src={src}
              alt="Campus"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

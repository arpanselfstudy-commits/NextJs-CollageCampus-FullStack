import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import styles from './BackButton.module.css'

interface BackButtonProps {
  href: string
  label: string
}

export default function BackButton({ href, label }: BackButtonProps) {
  return (
    <Link href={href} className={styles.btn}>
      <ArrowLeft size={14} />
      {label}
    </Link>
  )
}

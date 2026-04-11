'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  pages: number
  onPageChange: (p: number) => void
}

export default function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null

  const getPageNumbers = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | '...')[] = []
    let l: number | undefined

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }

    if (range[0] > 2) range.unshift(-1) // left dots marker
    if (range[range.length - 1] < pages - 1) range.push(-2) // right dots marker

    rangeWithDots.push(1)
    for (const i of range) {
      if (i === -1 || i === -2) rangeWithDots.push('...')
      else rangeWithDots.push(i)
    }
    if (pages > 1) rangeWithDots.push(pages)

    return rangeWithDots
  }

  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className={styles.dots}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${styles.btn} ${p === page ? styles.active : ''}`}
          >
            {p}
          </button>
        )
      )}

      <button
        className={styles.btn}
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

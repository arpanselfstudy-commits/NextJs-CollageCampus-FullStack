'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Search.module.css'

export interface SearchProps {
  placeholder?: string
  onSearch?: (value: string) => void
  debounceMs?: number
  defaultValue?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Search({
  placeholder = 'Search…',
  onSearch,
  debounceMs = 300,
  defaultValue = '',
  size = 'md',
}: SearchProps) {
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchRef = useRef(onSearch)
  useEffect(() => { onSearchRef.current = onSearch })

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearchRef.current?.(value), debounceMs)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value, debounceMs])

  const iconSize = { sm: 14, md: 16, lg: 18 }[size]

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} style={{ fontSize: iconSize }}>🔍</span>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={[
          styles.input,
          styles[`input--${size}`],
          value ? styles['input--hasClear'] : '',
        ].filter(Boolean).join(' ')}
      />

      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => { setValue(''); onSearch?.('') }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}

'use client'

import { InputHTMLAttributes, useState, forwardRef } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, fullWidth = true, id, type = 'text', className = '', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  const inputClass = [
    styles.input,
    error          ? styles['input--error']    : '',
    leftIcon       ? styles['input--hasLeft']  : '',
    isPassword || rightIcon ? styles['input--hasRight'] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={`${styles.wrapper} ${!fullWidth ? styles['wrapper--auto'] : ''}`}>
      {label && (
        <label htmlFor={id} className={`${styles.label} ${error ? styles['label--error'] : ''}`}>
          {label}
        </label>
      )}

      <div className={styles.inputRow}>
        {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}

        <input ref={ref} id={id} type={resolvedType} className={inputClass} {...props} />

        {isPassword && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        )}

        {!isPassword && rightIcon && (
          <span className={styles.iconRight}>{rightIcon}</span>
        )}
      </div>

      {error && <p className={styles.error}>⊘ {error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
})

export default Input

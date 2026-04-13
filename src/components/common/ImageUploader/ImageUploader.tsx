'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './ImageUploader.module.css'

export interface ImageUploaderProps {
  onFileSelect?: (file: File) => void
  onRemove?: () => void
  previewUrl?: string
  maxSizeMb?: number
  accept?: string
  variant?: 'square' | 'avatar' | 'banner'
  label?: string
  hint?: string
}

export default function ImageUploader({
  onFileSelect,
  onRemove,
  previewUrl,
  maxSizeMb = 10,
  accept = 'image/png,image/jpeg,image/webp,image/gif',
  variant = 'square',
  label,
  hint = 'PNG, JPG or WEBP',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external previewUrl changes (e.g. when user.photo loads after mount)
  useEffect(() => {
    if (previewUrl !== undefined) setPreview(previewUrl ?? null)
  }, [previewUrl])

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be under ${maxSizeMb}MB`)
      return
    }
    setPreview(URL.createObjectURL(file))
    onFileSelect?.(file)
  }, [maxSizeMb, onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  const openPicker = () => inputRef.current?.click()

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      style={{ display: 'none' }}
      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
    />
  )

  /* ── Avatar ─────────────────────────────────────────────── */
  if (variant === 'avatar') {
    return (
      <div className={styles.avatarWrapper}>
        <div className={styles.avatarThumb}>
          <div className={styles.avatarImg}>
            {preview
              ? <img src={preview} alt="avatar" />
              : <span className={styles.avatarInitial}>?</span>
            }
          </div>
          <button type="button" className={styles.avatarCamBtn} onClick={openPicker} aria-label="Upload photo">
            📷
          </button>
        </div>

        <div className={styles.avatarMeta}>
          <div className={styles.avatarTitle}>{label ?? 'Profile Picture'}</div>
          <div className={styles.avatarHint}>{hint}. Max size {maxSizeMb}MB.</div>
          <div className={styles.avatarActions}>
            <button type="button" className={styles.avatarUploadBtn} onClick={openPicker}>Upload New</button>
            {preview && (
              <button type="button" className={styles.avatarRemoveBtn} onClick={handleRemove}>Remove</button>
            )}
          </div>
          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        {hiddenInput}
      </div>
    )
  }

  /* ── Square / Banner ────────────────────────────────────── */
  const zoneClass = [
    styles.dropZone,
    variant === 'banner' ? styles['dropZone--banner'] : styles['dropZone--square'],
    dragging ? styles['dropZone--dragging'] : '',
    error    ? styles['dropZone--error']    : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.dropWrapper}>
      {label && <span className={styles.dropLabel}>{label}</span>}

      <div
        className={zoneClass}
        onClick={openPicker}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className={styles.previewImg} />
            <button
              type="button"
              className={styles.removeOverlayBtn}
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              aria-label="Remove image"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <span className={styles.dropIcon}>📷</span>
            <div className={styles.dropTitle}>{dragging ? 'Drop to upload' : 'Drop your imagery'}</div>
            <div className={styles.dropHint}>{hint} up to {maxSizeMb}MB</div>
          </>
        )}
      </div>

      {error && <p className={styles.errorMsg}>⊘ {error}</p>}
      {hiddenInput}
    </div>
  )
}

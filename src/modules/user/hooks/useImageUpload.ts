'use client'

import { useState, useCallback } from 'react'
import { uploadToCloudinary } from '@/lib/upload/cloudinary'
import toast from 'react-hot-toast'

/** Manages a list of local image previews and handles batch Cloudinary upload. */
export function useImageUpload(maxImages = 5) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    setImages((prev) => {
      const slots = maxImages - prev.length
      const newImgs = accepted.slice(0, slots).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      return [...prev, ...newImgs]
    })
  }, [maxImages])

  const removeImage = (i: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const uploadAll = async (): Promise<string[]> => {
    setIsUploading(true)
    try {
      return await Promise.all(images.map((img) => uploadToCloudinary(img.file)))
    } catch (err) {
      toast.error(`Image upload failed: ${err instanceof Error ? err.message : String(err)}`)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return { images, isUploading, onDrop, removeImage, uploadAll }
}

/** Manages a single profile photo with preview and Cloudinary upload. */
export function useProfilePhotoUpload() {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }, [])

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
  }

  const uploadPhoto = async (fallback: string): Promise<string> => {
    if (!photoFile) return fallback
    setIsUploading(true)
    try {
      return await uploadToCloudinary(photoFile)
    } catch (err) {
      toast.error('Image upload failed. Please try again.')
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return { photoFile, photoPreview, isUploading, onDrop, removePhoto, uploadPhoto }
}

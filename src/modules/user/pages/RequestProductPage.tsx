'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import { uploadToCloudinary } from '@/lib/upload/cloudinary'
import RequestProductView from '@/modules/user/components/RequestProductView'
import toast from 'react-hot-toast'
import type { ListedProductCategory } from '@/modules/marketplace/types'

export default function RequestProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateRequestedProduct()

  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', category: 'ELECTRONICS' as ListedProductCategory,
    priceFrom: 0, priceTo: 0, isNegotiable: false,
    description: '', email: '', phoneNo: '',
  })

  const onDrop = useCallback((accepted: File[]) => {
    const newImgs = accepted.slice(0, 5 - images.length).map((file) => ({
      file, preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImgs])
  }, [images])

  const removeImage = (i: number) => {
    setImages((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i) })
  }

  const handleSubmit = async () => {
    if (!user || images.length === 0) return
    setIsUploading(true)
    let uploadedUrls: string[]
    try {
      uploadedUrls = await Promise.all(images.map((img) => uploadToCloudinary(img.file)))
    } catch (err) {
      toast.error(`Image upload failed: ${err instanceof Error ? err.message : String(err)}`)
      return
    } finally {
      setIsUploading(false)
    }
    create({
      user: user._id, name: form.name, images: uploadedUrls,
      category: form.category,
      price: { from: form.priceFrom, to: form.priceTo },
      isNegotiable: form.isNegotiable, description: form.description,
      contactDetails: { email: form.email, phoneNo: form.phoneNo },
      isFulfilled: false,
    }, { onSuccess: () => router.push('/account/my-profile') })
  }

  return (
    <RequestProductView
      form={form}
      onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
      images={images}
      onDrop={onDrop}
      onRemoveImage={removeImage}
      isPending={isPending}
      isUploading={isUploading}
      onSubmit={handleSubmit}
    />
  )
}
